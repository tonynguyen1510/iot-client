/* --------------------------------------------------------
* Author Trần Đức Tiến
* Email ductienas@gmail.com
* Phone 0972970075
*
* Created: 2018-04-02 00:25:00
*------------------------------------------------------- */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withStyles from 'src/theme/jss/withStyles';
import moment from 'moment';
import { injectIntl, intlShape } from 'react-intl';
import getAirport from 'src/utils/getAirport';

import { Form, Icon, Input, Button, Radio, Select, Row, Col, TimePicker, InputNumber, Upload, AutoComplete } from 'antd';

import { locationOptions, flightOptions } from 'src/constants/selectOption';
import AuthStorage from 'src/utils/AuthStorage';

import IconDeparture from 'src/components/Photo/IconDeparture';

import { getTicketSellingList } from 'src/redux/actions/ticket-selling';
import { getTicketBuyingList, createTicketBuying } from 'src/redux/actions/ticket-buying';
import { toggleTicketPosterModal } from 'src/redux/actions/modal';
import { uploadFiles } from 'src/redux/actions/upload';

import { getLabel } from 'src/utils';
import DatePicker from 'src/components/DatePickerLunar';

import PosterDivider from './PosterDivider';

const { TextArea } = Input;
const { Option } = Select;

const styleSheet = (/* theme */) => ({
	root: {
		position: 'relative',
		textAlign: 'left',
		padding: 20,

		'& .ant-upload.ant-upload-select-picture-card': {
			width: 70,
			height: 70,
		},

		'& .ant-upload-list-picture-card .ant-upload-list-item': {
			width: 70,
			height: 70,
		},
	},
	header: {
		textTransform: 'uppercase',
		fontWeight: 'bold',
		marginBottom: 20,
	},
	closeBtn: {
		position: 'absolute',
		right: 10,
		top: 10,
		fontSize: '20px',
		cursor: 'pointer',
	},
	form: {

	},
	formItem: {
		'& > span': {
			display: 'flex',
		},
	},
	formLabel: {
		lineHeight: '39.9999px',
	},
	action: {
		textAlign: 'right',
	},
	actionGroup: {
		// marginBottom: 15,
	},
});

function mapStateToProps(state) {
	return {
		store: {
			auth: state.get('auth').toJS(),
			modal: state.get('modal').toJS(),
		},
	};
}

const mapDispatchToProps = (dispatch) => {
	return {
		action: bindActionCreators({
			getTicketSellingList,
			getTicketBuyingList,
			createTicketBuying,
			toggleTicketPosterModal,
			uploadFiles,
		}, dispatch),
	};
};

@withStyles(styleSheet)
@connect(mapStateToProps, mapDispatchToProps)
@Form.create()
@injectIntl
export default class TicketPosterForm extends Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		form: PropTypes.shape({
			validateFields: PropTypes.func,
			resetFields: PropTypes.func,
		}).isRequired,
		action: PropTypes.shape({
			getTicketSellingList: PropTypes.func.isRequired,
			getTicketBuyingList: PropTypes.func.isRequired,
			createTicketBuying: PropTypes.func,
			toggleTicketPosterModal: PropTypes.func,
			uploadFiles: PropTypes.func,
		}).isRequired,
		intl: intlShape.isRequired,
	}

	static defaultProps = {
	}

	state = {
		loading: false,
		fileList: [],
		destinationSource: [],
		departureSource: [],
	}

	filter = {
		limit: 4,
		skip: 0,
		page: 1,
		include: [
			{
				relation: 'creator',
				scope: {
					fields: ['id', 'username', 'avatar', 'fullName', 'ratingsCount', 'ratingsStats'],
				},
			},
		],
		where: {
			status: 'open',
			dueDate: {
				gte: new Date(),
			},
		},
	}

	dateRender = (current) => {
		return (
			<div className="ant-calendar-date">
				<div className="text-left">{current.date()}</div>
				<div className="text-right" style={{ lineHeight: 1.5, fontSize: 10, color: 'blue' }}>{current.date()}</div>
			</div>
		);
	}

	validateSeatCount = (rule, seatCount, callback) => {
		const { formatMessage } = this.props.intl;

		if (seatCount < 1) {
			callback(formatMessage({ id: 'validate_seat_count' }));
		} else {
			callback();
		}
	}

	validateDestination = (rule, destination, callback) => {
		const { form, intl: { formatMessage } } = this.props;
		const departure = form.getFieldValue('trip.departure');
		const departureCode = departure.substr(-5).substr(1, 3);
		const destinationCode = destination.substr(-5).substr(1, 3);

		if (departureCode === destinationCode) {
			callback(formatMessage({ id: 'departure_destination_not_equal' }));
		} else {
			callback();
		}
	}

	validateTripStartDate = (rule, tripStartDate, callback) => {
		const { formatMessage } = this.props.intl;
		if (!tripStartDate) {
			return callback();
		}
		if (moment().isAfter(tripStartDate, 'day')) {
			callback(formatMessage({ id: 'validate_trip_start_date' }));
		} else {
			callback();
		}
	}

	validateTripStartTime = (rule, tripStartTime, callback) => {
		if (!tripStartTime) {
			return callback();
		}
		const { form, intl: { formatMessage } } = this.props;
		const tripStartDate = form.getFieldValue('trip.startDate');
		const tripStart = moment(tripStartDate).hours(tripStartTime.hours()).minutes(tripStartTime.minutes());

		if (tripStart.isBefore(moment())) {
			callback(formatMessage({ id: 'validate_trip_start_time' }));
		} else {
			callback();
		}
	}

	validateTripBackStartDate = (rule, tripBackStartDate, callback) => {
		if (!tripBackStartDate) {
			return callback();
		}
		const { form, intl: { formatMessage } } = this.props;
		const tripStartDate = form.getFieldValue('trip.startDate');
		if (tripBackStartDate.isBefore(tripStartDate, 'day')) {
			callback(formatMessage({ id: 'validate_trip_back_start_date' }));
		} else {
			callback();
		}
	}

	validateTripBackStartTime = (rule, tripBackStartTime, callback) => {
		if (!tripBackStartTime) {
			return callback();
		}
		const { form, intl: { formatMessage } } = this.props;
		const tripStartDate = form.getFieldValue('trip.startDate');
		const tripStartTime = form.getFieldValue('trip.startTime');
		const tripBackStartDay = form.getFieldValue('tripBack.startDate');
		const tripStart = moment(tripStartDate).hours(tripStartTime.hours()).minutes(tripStartTime.minutes());
		const tripBackStart = moment(tripBackStartDay).hours(tripBackStartTime.hours()).minutes(tripBackStartTime.minutes());

		if (tripBackStart.isBefore(tripStart)) {
			callback(formatMessage({ id: 'validate_trip_back_start_time' }));
		} else {
			callback();
		}
	}

	handleChange = ({ fileList }) => this.setState({ fileList })

	timeout = null

	handleSearchDeparture = (value) => {
		clearTimeout(this.timeout);
		this.timeout = setTimeout(this.searchAirport.bind(this, value, 'departureSource'), 300);
	}

	handleSearchDestination = (value) => {
		clearTimeout(this.timeout);
		this.timeout = setTimeout(this.searchAirport.bind(this, value, 'destinationSource'), 300);
	}

	searchAirport = (query, stateName) => {
		getAirport(query).then(source => {
			this.setState({ [stateName]: source });
		});
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const { packageWeight, packageWeightOther, type, trip, tripBack, ...dataSend } = values;

				dataSend.isBid = type === 'bid';

				dataSend.packageWeight = packageWeight !== -1 ? packageWeight : ~~packageWeightOther;

				dataSend.dueDate = moment(trip.startDate).hours(trip.startTime.hours(), trip.startTime.minutes());

				dataSend.trip = {
					...trip,
					startDate: trip.startDate,
					startTime: trip.startTime && trip.startTime.format('HH:mm'),
				};

				if (tripBack) {
					dataSend.tripBack = {
						...tripBack,
						startDate: tripBack.startDate,
						startTime: tripBack.startTime && tripBack.startTime.format('HH:mm'),
					};
				}

				dataSend.creatorId = AuthStorage.userId;

				this.setState({
					loading: true,
				});

				this.props.action.uploadFiles({ files: this.state.fileList }, (imageList = []) => {
					dataSend.images = imageList;

					this.props.action.createTicketBuying(dataSend, () => {
						this.setState({
							loading: false,
						}, () => {
							this.props.action.toggleTicketPosterModal({ open: false });
							this.props.form.resetFields();

							const p1 = new Promise((resolve) => {
								this.props.action.getTicketSellingList({ filter: this.filter, firstLoad: true }, () => {
									resolve();
								});
							});

							const p2 = new Promise((resolve) => {
								this.props.action.getTicketBuyingList({ filter: this.filter, firstLoad: true }, () => {
									resolve();
								});
							});

							Promise.all([
								p1,
								p2,
							]).then(() => {
								this.setState({ loading: false });
							});
						});
					}, () => {
						this.setState({
							loading: false,
						});
					});
				});
			}
		});
	}

	render() {
		const { form: { getFieldDecorator, getFieldValue }, classes, action, intl: { formatMessage } } = this.props;

		return (
			<div className={classes.root}>
				<Icon type="close-circle" className={classes.closeBtn} onClick={this.state.loading ? f => f : () => action.toggleTicketPosterModal({ open: false })} />
				<div className={classes.header}>
					{formatMessage({ id: 'fill_ticket_buying' })}
				</div>
				<Form onSubmit={this.handleSubmit} className={classes.form}>
					<Form.Item>
						<div className={classes.formItem}>
							<div className={classes.formLabel}> {formatMessage({ id: 'comment_content' })} </div>
							{getFieldDecorator('content', {
								rules: [{ required: true, message: formatMessage({ id: 'comment_content_required' }) }],
							})(
								<TextArea rows={4} style={{ resize: 'none' }} />,
							)}
						</div>
					</Form.Item>
					<Form.Item>
						<Row className={classes.formItem} type="flex">
							<Col col={3} xs={4} className={classes.formLabel}>{formatMessage({ id: 'ticket_type' })} </Col>
							<Col col={21} xs={20}>
								{getFieldDecorator('flightType', {
									initialValue: 'oneWay',
								})(
									<Radio.Group>
										<Radio value="oneWay"> {formatMessage({ id: 'one_way' })} </Radio>
										<Radio value="roundTrip"> {formatMessage({ id: 'round_trip' })} </Radio>
									</Radio.Group>,
								)}
							</Col>
						</Row>
					</Form.Item>
					<Form.Item>
						<div className={classes.formItem}>
							<Col col={3} xs={4} className={classes.formLabel}> {formatMessage({ id: 'ticket_seat_count' })} </Col>
							<Col col={21} xs={20}>
								{getFieldDecorator('seatCount', {
									initialValue: 1,
									rules: [{ required: true, message: formatMessage({ id: 'seat_count_required' }) }, { validator: this.validateSeatCount }],
								})(
									<InputNumber size="default" style={{ width: 70 }} />,
								)}
							</Col>
						</div>
					</Form.Item>
					<Form.Item>
						<div className={classes.formItem}>
							<Col col={3} xs={4} className={classes.formLabel}> {formatMessage({ id: 'airline' })} </Col>
							<Col col={11} xs={20}>
								{getFieldDecorator('airline', {
									initialValue: flightOptions[0].value,
								})(
									<Select
										size="default"
										style={{ width: 200 }}
									>
										{flightOptions.map(item => <Option value={item.value} key={item.value}>{item.label}</Option>)}
									</Select>,
								)}
							</Col>
							{
								getLabel(getFieldValue('airline'), flightOptions).value !== 'all' &&
								<Col span={10}> <img src={getLabel(getFieldValue('airline'), flightOptions).logo} alt="airline_logo" style={{ height: 21 }} /> </Col>
							}
						</div>
					</Form.Item>
					<PosterDivider title={formatMessage({ id: 'way_to_go' })} titleWidth={13} />
					<Row className={classes.formItem} type="flex">
						<Col span={10}>
							<Form.Item>
								<div className={classes.formItem}>
									<div className={classes.formLabel}> {formatMessage({ id: 'departure' })} </div>
									{getFieldDecorator('trip.departure', {
										rules: [{ required: true, message: formatMessage({ id: 'departure_required' }) }],
									})(
										<AutoComplete
											dataSource={this.state.departureSource}
											style={{ width: '100%' }}
											size="default"
											onSearch={this.handleSearchDeparture}
										/>,
									)}
								</div>
							</Form.Item>
						</Col>
						<Col span={4} style={{ textAlign: 'center', paddingTop: 45 }}> <IconDeparture color="#4368C4" /> </Col>
						<Col span={10}>
							<Form.Item>
								<div className={classes.formItem}>
									<div className={classes.formLabel}> {formatMessage({ id: 'destination' })} </div>
									{getFieldDecorator('trip.destination', {
										rules: [{ required: true, message: formatMessage({ id: 'destination_required' }) }, { validator: this.validateDestination }],
									})(
										<AutoComplete
											dataSource={this.state.destinationSource}
											style={{ width: '100%' }}
											size="default"
											onSearch={this.handleSearchDestination}
										/>,
									)}
								</div>
							</Form.Item>
						</Col>
					</Row>
					<Row className={classes.formItem} type="flex" style={{ marginBottom: 10 }}>
						<Col span={20}>
							<div className={classes.formItem}>
								<div className={classes.formLabel}> {formatMessage({ id: 'start_date' })} </div>
								<div style={{ display: 'flex' }}>
									<Form.Item>
										{getFieldDecorator('trip.startDate', {
											rules: [{ type: 'object', required: true, message: formatMessage({ id: 'start_date_required' }) }, { validator: this.validateTripStartDate }],
										})(
											<DatePicker
												format="DD/MM/YYYY"
												// dateRender={this.dateRender}
												disabledDate={
													(current) => {
														const tripEndDate = getFieldValue('tripBack.startDate');
														// Can not select days before today and today
														if (!tripEndDate) {
															return current && current.isBefore(new Date(), 'day');
														}
														return current && (current.isAfter(tripEndDate, 'day') || current.isBefore(new Date(), 'day'));
													}
												}
											/>,
										)}
									</Form.Item>
									<Form.Item>
										{getFieldDecorator('trip.startTime', {
											rules: [{ type: 'object', required: true, message: formatMessage({ id: 'start_time_required' }) }, { validator: this.validateTripStartTime }],
										})(
											<TimePicker format="HH:mm" style={{ marginLeft: 20 }} />,
										)}
									</Form.Item>
								</div>
							</div>
						</Col>
					</Row>
					{
						getFieldValue('flightType') !== 'oneWay' &&
						<div style={{ marginBottom: 24 }}>
							<PosterDivider title={formatMessage({ id: 'way_to_back' })} titleWidth={13} />
							<Row className={classes.formItem} type="flex">
								<Col span={10}>
									<Form.Item>
										<div className={classes.formItem}>
											<div className={classes.formLabel}> {formatMessage({ id: 'departure' })} </div>
											{getFieldDecorator('tripBack.departure', {
												rules: [{ required: true, message: formatMessage({ id: 'departure_required' }) }],
												initialValue: getFieldValue('trip.destination'),
											})(
												<Select
													size="default"
													style={{ width: '100%' }}
													disabled
												>
													{locationOptions.map(item => <Option value={item.value} key={item.value}>{item.label}</Option>)}
												</Select>,
											)}
										</div>
									</Form.Item>
								</Col>
								<Col span={4} style={{ textAlign: 'center', paddingTop: 45 }}> <IconDeparture color="#4368C4" style={{ transform: 'rotateY(180deg)' }} /> </Col>
								<Col span={10}>
									<Form.Item>
										<div className={classes.formItem}>
											<div className={classes.formLabel}>{formatMessage({ id: 'destination' })} </div>
											{getFieldDecorator('tripBack.destination', {
												rules: [{ required: true, message: formatMessage({ id: 'destination_required' }) }],
												initialValue: getFieldValue('trip.departure'),
											})(
												<Select
													size="default"
													style={{ width: '100%' }}
													disabled
												>
													{locationOptions.map(item => <Option value={item.value} key={item.value}>{item.label}</Option>)}
												</Select>,
											)}
										</div>
									</Form.Item>
								</Col>
							</Row>
							<Row className={classes.formItem} type="flex" style={{ marginBottom: 10 }}>
								<Col span={20}>
									<div className={classes.formItem}>
										<div className={classes.formLabel}> {formatMessage({ id: 'start_date' })} </div>
										<div style={{ display: 'flex' }}>
											<Form.Item>
												{getFieldDecorator('tripBack.startDate', {
													rules: [{ type: 'object', required: true, message: formatMessage({ id: 'start_date_required' }) }, { validator: this.validateTripBackStartDate }],
												})(
													<DatePicker
														format="DD/MM/YYYY"
														disabledDate={
															(current) => {
																const tripStartDate = getFieldValue('trip.startDate');
																// Can not select days before today and today
																return current && current.isBefore(tripStartDate, 'day');
															}
														}
													/>,
												)}
											</Form.Item>
											<Form.Item>
												{getFieldDecorator('tripBack.startTime', {
													rules: [{ type: 'object', required: true, message: formatMessage({ id: 'start_time_required' }) }, { validator: this.validateTripBackStartTime }],
												})(
													<TimePicker format="HH:mm" style={{ marginLeft: 20 }} />,
												)}
											</Form.Item>
										</div>
									</div>
								</Col>
							</Row>
						</div>
					}
					<PosterDivider title={formatMessage({ id: 'other_info' })} titleWidth={23} />
					<Form.Item>
						<Row className={classes.formItem} type="flex">
							<Col span={6} className={classes.formLabel}> {formatMessage({ id: 'seat_type' })} </Col>
							<Col span={18}>
								{getFieldDecorator('seatType', {
									initialValue: 'promo',
								})(
									<Radio.Group>
										<Radio value="promo"> Promo </Radio>
										<Radio value="eco"> Eco </Radio>
										<Radio value="skyboss"> Skyboss </Radio>
									</Radio.Group>,
								)}
							</Col>
						</Row>
					</Form.Item>
					<Form.Item>
						<Row className={classes.formItem} type="flex">
							<Col span={6} className={classes.formLabel}> {formatMessage({ id: 'package_weight' })} </Col>
							<Col span={18} style={{ display: 'flex' }}>
								{getFieldDecorator('packageWeight', {
									initialValue: 7,
								})(
									<Radio.Group>
										<Radio value={7}> 7kg </Radio>
										<Radio value={20}> 20kg </Radio>
										<Radio value={-1}> { formatMessage({ id: 'other' }) } </Radio>
									</Radio.Group>,
								)}
								{
									getFieldValue('packageWeight') === -1 &&
									<Form.Item style={{ margin: 0 }}>
										{getFieldDecorator('packageWeightOther', {
											rules: [{ required: true, message: formatMessage({ id: 'package_weight_required' }) }],
										})(
											<Input type="number" autoFocus size="default" maxLength="25" style={{ width: 90, marginLeft: 10 }} suffix="KG" />,
										)}
									</Form.Item>
								}
							</Col>
						</Row>
					</Form.Item>
					<Row className={classes.formItem} type="flex">
						{/* <span>
							<Button type="primary" style={{ background: '#E6EAED', border: 'solid 1px #F0F4F7', width: 70, height: 70 }}>
								<Icon type="plus" style={{ color: '#BACAD6', fontSize: 20 }} />
							</Button>
						</span> */}
						<Upload
							// action="//jsonplaceholder.typicode.com/posts/"
							listType="picture-card"
							fileList={this.state.fileList}
							onChange={this.handleChange}
						>
							{this.state.fileList.length >= 3 ? null : <Icon type="plus" style={{ color: '#BACAD6', fontSize: 20 }} />}
						</Upload>
						<span style={{ lineHeight: '65px', marginLeft: '15px' }} >
							{formatMessage({ id: 'attached_image' })}
						</span>
					</Row>
					<PosterDivider />
					<div className={classes.action}>
						{/* <Form.Item>
							<div className={classes.actionGroup}>
								{getFieldDecorator('type', {
									initialValue: 'sell',
								})(
									<Radio.Group>
										<Radio.Button value="bid"> Đấu thầu </Radio.Button>
										<Radio.Button value="sell"> Cố định </Radio.Button>
									</Radio.Group>,
								)}
							</div>
						</Form.Item>
						<Form.Item>
							{
								getFieldValue('type') !== 'Buy' &&
								<div className={classes.actionGroup}>
									<span> {getFieldValue('type') === 'Sell' ? 'Giá đăng bán' : 'Giá khởi điểm'} </span>
									<span>
										{getFieldDecorator('price', {
											rules: [{ required: true, message: 'Làm ơn nhập giá' }],
										})(
											<InputNumber
												formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
												className="price"
												style={{ width: 150, marginLeft: 10, marginRight: 0 }}
											/>,
										)}
									</span>
								</div>
							}
						</Form.Item> */}
						<div className={classes.actionGroup}>
							<Button type="primary" htmlType="submit" loading={this.state.loading}> {formatMessage({ id: 'posting' })} </Button>
							<Button style={{ marginLeft: 10 }} disabled={this.state.loading} onClick={() => action.toggleTicketPosterModal({ open: false })}>{formatMessage({ id: 'cancel' })}</Button>
						</div>
					</div>
				</Form>
			</div>
		);
	}
}

