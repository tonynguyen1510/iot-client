/* --------------------------------------------------------
* Author Trần Đức Tiến
* Email ductienas@gmail.com
* Phone 0972970075
*
* Created: 2018-03-15 16:45:12
*------------------------------------------------------- */

import React from 'react';
import PropTypes from 'prop-types';

import withStyles from 'src/theme/jss/withStyles';

import { Row, Col } from 'antd';

import Container from 'src/components/Layout/Container';

const styles = (/* theme */) => ({
	root: {
		padding: '40px 0 50px !important',
		// marginTop: '24px',
		background: '#ededed',
		borderTop: '1px solid #e4e1e1',
	},
	logo: {
		height: '30px',
		marginBottom: '20px',
	},
});

const Footer = (props) => {
	const { classes = {} } = props;

	return (
		<footer className={classes.root + ' text-center-xs-down'}>
			<Container>
				<img className={classes.logo} src="/static/assets/images/logo/2x.png" alt="chove.vn" />
				<Row type="flex">
					<Col md={12} xs={24}>
						Hệ thống bán thanh lý các loạ vé giá rẻ. Phiên bản beta1. <br />
						Địa chỉ: 172 Hai Bà Trưng, Q1, TP.HCM. <br />
						Hotline: 0909 418 086<br />
					</Col>
					<Col md={12} xs={24}>
						Một sản phẩm của Tamotech Inc <br />
						© Chove.vn <br />
						Icons made by Freepik from www.flaticon.com is licensed by CC 3.0 BY <br />
					</Col>
				</Row>
			</Container>
		</footer>
	);
};

Footer.propTypes = {
	classes: PropTypes.object.isRequired,
};

Footer.defaultProps = {
	// classes: {},
};

export default withStyles(styles)(Footer);