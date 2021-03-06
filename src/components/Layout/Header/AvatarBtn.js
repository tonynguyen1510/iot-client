/* --------------------------------------------------------
* Author Trần Đức Tiến
* Email ductienas@gmail.com
* Phone 0972970075
*
* Created: 2018-01-09 17:44:33
*------------------------------------------------------- */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withStyles from 'src/theme/jss/withStyles';
import { injectIntl, intlShape } from 'react-intl';

import { Popover, Icon, Divider } from 'antd';

import { Router } from 'src/routes';

import Avatar from 'src/components/Photo/Avatar';
import IconDeparture from 'src/components/Photo/IconDeparture';

import { logoutRequest } from 'src/redux/actions/auth';
import { toggleUserInfoModal } from 'src/redux/actions/modal';

const styles = (/* theme */) => ({
	root: {
		display: 'flex',
		height: '46px',
		alignItems: 'center',
	},
	avatar: {
		cursor: 'pointer',
	},
	title: {
		minWidth: 220,
		display: 'flex',
		alignItems: 'center',
		padding: '15px',
		margin: '-5px -16px -4px',
		background: '#eeeeeea6',
		zIndex: '1',
		position: 'relative',
		borderRadius: '5px 5px 0 0',

		'@media (max-width: 991.98px)': {
			background: '#FFF',
			margin: 0,
			borderBottom: '1px solid #e8e8e8',
		},
	},
	info: {
		marginLeft: '10px',
		'& h4': {
			margin: '0',
			lineHeight: '1',
		},
		'& i': {
			fontSize: '12px',
			color: 'rgba(0, 0, 0, 0.45)',
		},
	},
	content: {
		margin: '-12px -16px',

		'@media (max-width: 991.98px)': {
			margin: 0,
		},
	},
	item: {
		padding: '10px 16px',
		display: 'flex',
		cursor: 'pointer',
		alignItems: 'center',
		'& i': {
			fontSize: '16px',
			marginRight: '15px',
		},
		'&:hover': {
			background: '#eee',
		},

		'@media (max-width: 991.98px)': {
			fontWeight: 500,
		},
	},
	divider: {
		margin: '0',
		top: '0',
	},
	itemWrapper: {
		padding: '5px 0',
	},
	rightSidebar: {
		position: 'fixed',
		top: 65,
		right: -300,
		width: 300,
		height: 'calc(100vh - 65px)',
		background: '#FFF',
		display: 'flex',
		flexDirection: 'column',
		transition: 'right 300ms ease',
		overflow: 'hidden',
		zIndex: 10,

		'&.active': {
			right: 0,
		},

		'& ul': {
			listStyle: 'none',
			padding: 0,
			margin: 0,
		},

		// '& li': {
		// 	padding: 20,
		// 	borderBottom: '1px solid #F2F2F2',
		// },
	},
	overlay: {
		position: 'fixed',
		width: '100vw',
		height: '100vh',
		background: '#000',
		zIndex: 9,
		opacity: 0.1,
		top: 0,
		left: 0,
	},
});

function mapStateToProps(state) {
	return {
		store: {
			auth: state.get('auth').toJS(),
		},
	};
}

const mapDispatchToProps = (dispatch) => {
	return {
		action: bindActionCreators({
			logoutRequest,
			toggleUserInfoModal,
		}, dispatch),
	};
};

// const AvatarBtn = ({ store, action, classes, isMobile }) => {
@injectIntl
class AvatarBtn extends React.Component {
	state = {}

	logout = () => {
		this.props.action.logoutRequest(() => {
			Router.pushRoute('/');
		});
	}

	toggleRightSidebar = () => {
		this.setState({ activeRightSideBar: !this.state.activeRightSideBar });
	}

	hideRightSideBar = () => {
		this.setState({ activeRightSideBar: false });
	}

	render() {
		const { classes, store, action, isMobile, intl: { formatMessage } } = this.props;
		const content = (
			<div className={classes.content}>
				{/* <div className={classes.itemWrapper}>
				<div className={classes.item} onClick={() => action.toggleUserInfoModal({ open: true, id: store.auth.id })}>
					<Icon type="clock-circle-o" />
					<span> Lịch sử giao dịch cá nhân </span>
				</div>
			</div>
			<Divider className={classes.divider} /> */}
				<div className={classes.itemWrapper}>
					<div className={classes.item} onClick={() => action.toggleUserInfoModal({ open: true, id: store.auth.id })}>
						<Icon type="user" />
						<span> {formatMessage({ id: 'personal_info' })} </span>
					</div>
				</div>
				{
					store.auth && store.auth.loginType === 'email' &&
					<Fragment>
						<Divider className={classes.divider} />
						<div className={classes.itemWrapper}>
							<div className={classes.item} onClick={() => Router.pushRoute('/change-password')}>
								<Icon type="setting" />
								<span>{formatMessage({ id: 'change_password' })}</span>
							</div>
						</div>
					</Fragment>
				}
				<Divider className={classes.divider} />
				<div className={classes.itemWrapper}>
					{
						<div className={classes.item} onClick={() => Router.pushRoute('/user-ticket-list')}>
							{ isMobile ? <IconDeparture size={16} color="#000" /> : <IconDeparture size={16} /> }
							<span style={{ marginLeft: 15 }}>  {formatMessage({ id: 'my_post' })} </span>
						</div>
					}
				</div>
				<Divider className={classes.divider} />
				<div className={classes.itemWrapper}>
					<div className={classes.item} onClick={this.logout}>
						<Icon type="logout" />
						<span> {formatMessage({ id: 'logout' })} </span>
					</div>
				</div>
			</div>
		);
		const title = (
			<div className={classes.title}>
				<Avatar size={50} src={store.auth.avatar} name={store.auth.fullName} />
				<div className={classes.info}>
					<h4>{store.auth.fullName}</h4>
					{/* <i>{store.auth.email}</i> */}
				</div>
			</div>
		);

		if (isMobile) {
			return (
				<Fragment>
					<Avatar className={classes.avatar} name={store.auth.fullName} src={store.auth.avatar} onClick={this.toggleRightSidebar} />
					<div className={[classes.rightSidebar, this.state.activeRightSideBar ? 'active' : ''].join(' ')}>
						<div className={classes.title}>
							<Avatar size={35} src={store.auth.avatar} name={store.auth.fullName} />
							<div className={classes.info}>
								<h4>{store.auth.fullName}</h4>
								{/* <i>{store.auth.email}</i> */}
							</div>
						</div>
						{content}
					</div>
					{
						this.state.activeRightSideBar && <div className={classes.overlay} onClick={this.hideRightSideBar} />
					}
				</Fragment>
			);
		}

		return (
			<Popover content={content} title={title} trigger="click" placement="bottomRight">
				<div className={classes.root}>
					<Avatar className={classes.avatar} name={store.auth.fullName} src={store.auth.avatar} />
					<Icon type="down" style={{ marginLeft: '5px', fontWeight: 'bold', cursor: 'pointer' }} className="hidden-sm-down" />
				</div>
			</Popover>
		);
	}
}


AvatarBtn.propTypes = {
	classes: PropTypes.object.isRequired,
	// store
	store: PropTypes.shape({
		auth: PropTypes.object.isRequired,
	}).isRequired,
	// action
	action: PropTypes.shape({
		logoutRequest: PropTypes.func.isRequired,
		toggleUserInfoModal: PropTypes.func.isRequired,
	}).isRequired,
	intl: intlShape.isRequired,
};

AvatarBtn.defaultProps = {
	// classes: {},
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AvatarBtn));
