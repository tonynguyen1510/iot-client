/* --------------------------------------------------------
* Author Trần Đức Tiến
* Email ductienas@gmail.com
* Phone 0972970075
*
* Created: 2018-02-04 15:43:52
*------------------------------------------------------- */

import React from 'react';

import Document, { Head, Main, NextScript } from 'next/document';

import JssProvider from 'react-jss/lib/JssProvider';

import getPageContext from 'src/theme/jss/getPageContext';

import stylesheet from 'src/theme/antd/theme.less';

export default class MyDocument extends Document {
	static async getInitialProps(ctx) {
		// Resolution order
		//
		// On the server:
		// 1. page.getInitialProps
		// 2. document.getInitialProps
		// 3. page.render
		// 4. document.render
		//
		// On the server with error:
		// 2. document.getInitialProps
		// 3. page.render
		// 4. document.render
		//
		// On the client
		// 1. page.getInitialProps
		// 3. page.render

		// Get the context of the page to collected side effects.
		const pageContext = getPageContext();
		const page = ctx.renderPage(Component => props => (
			<JssProvider
				registry={pageContext.sheetsRegistry}
				generateClassName={pageContext.generateClassName}
			>
				<Component pageContext={pageContext} {...props} />
			</JssProvider>
		));

		const css = pageContext.sheetsRegistry.toString();

		return {
			...page,
			pageContext,
			styles: (
				<style
					id="jss-server-side"
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{ __html: css }}
				/>
			),
		};
	}

	render() {
		const { canonical, pageContext } = this.props;

		return (
			<html lang="vi" dir="ltr">
				<Head>
					<title>NTU IOT</title>
					<link rel="shortcut icon" type="image/x-icon" href="/static/assets/favicon.ico" />
					<meta charSet="utf-8" />
					{/* Use minimum-scale=1 to enable GPU rasterization */}
					<meta
						name="viewport"
						content={
							'user-scalable=0, initial-scale=1, ' +
							'minimum-scale=1, width=device-width, height=device-height'
						}
					/>
					{/* PWA primary color */}
					<meta name="theme-color" content={pageContext.theme.palette.primary[900]} />
					<style id="insertion-point-jss" />
					{/* Twitter */}
					<meta name="twitter:card" content="summary" />
					<meta name="twitter:site" content="@alfazi" />
					{/* Facebook */}
					<meta property="og:type" content="website" />
					<meta property="og:locale" content="vi_VN" />

					<link rel="shortcut icon" href="/static/assets/favicon.ico" />
					<link rel="canonical" href={canonical} />
					<link
						rel="stylesheet"
						href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
					/>
					<style dangerouslySetInnerHTML={{ __html: stylesheet }} />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</html>
		);
	}
}
