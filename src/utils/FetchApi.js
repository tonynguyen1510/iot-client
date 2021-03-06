/* --------------------------------------------------------
* Author Trần Đức Tiến
* Email ductienas@gmail.com
* Phone 0972970075
*
* Created: 2018-01-10 23:11:06
*------------------------------------------------------- */
import merge from 'lodash/merge';
import { put, call, select } from 'redux-saga/effects';

import { Router } from 'src/routes';

import API from 'src/constants/api';
import ENV from 'src/constants/env';

import AuthStorage from 'src/utils/AuthStorage';
import { REQUEST_ERROR } from 'src/redux/actions/type';
import vi from 'src/lang/vi.json';
import en from 'src/lang/en.json';

const { API_URL } = API;

const fetching = (url, options) => fetch(API_URL + url, options)
	.then(response => {
		return response.status === 204 || response.statusText === 'No Content' ? {} : response.json();
	})
	.then(json => {
		if (json.error) {
			throw json.error;
		} else {
			return json;
		}
	})
	.catch(err => {
		throw err;
	});

/* The example data is structured as follows:

Params: {
	uri: ,
	params: ,
	opt: ,
	loading: ,
	uploadFile: ,
}
*/
export const fetchApiWithoutSaga = ({ uri, params = {}, opt = {}, uploadFile = false }) => {
	const defaultOptions = {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
	};

	if (!uri) {
		return;
	}

	const options = merge(defaultOptions, opt);

	if (uploadFile && params.files) {
		options.headers = {};
	}

	// set token
	if (AuthStorage.loggedIn) {
		options.headers.Authorization = AuthStorage.token;
	}

	let url = uri;

	if (params && Object.keys(params).length > 0) {
		if (options && options.method === 'GET') {
			url += '?' + Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
		} else if (uploadFile && params.files) {
			const formData = new FormData();
			params.files.forEach((img) => {
				formData.append('files', img, img.renameFilename || img.name);
			});

			options.body = formData;
		} else {
			options.body = JSON.stringify(params);
		}
	}

	return fetching(url, options);
};

export default function* ({ uri, params = {}, opt = {}, loading = true, uploadFile = false }) {
	const defaultOptions = {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
	};

	if (!uri) {
		return;
	}

	const options = merge(defaultOptions, opt);

	if (uploadFile && params.files) {
		options.headers = {};
	}

	// set token
	if (AuthStorage.loggedIn) {
		options.headers.Authorization = AuthStorage.token;
	}

	let url = uri;

	if (params && Object.keys(params).length > 0) {
		if (options && options.method === 'GET') {
			url += '?' + Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
		} else if (uploadFile && params.files) {
			const formData = new FormData();
			params.files.forEach((img) => {
				formData.append('files', img, img.renameFilename || img.name);
			});

			options.body = formData;
		} else {
			options.body = JSON.stringify(params);
		}
	}

	if (loading) {
		yield put({ type: 'TOGGLE_LOADING' });
	}

	let response;
	try {
		if (ENV !== 'production') {
			console.info('====> Call ' + API_URL + url, ', options=', options);
		}

		response = yield call(fetching, url, options);

		if (loading) {
			yield put({ type: 'TOGGLE_LOADING' });
		}
	} catch (error) {
		response = { error };

		const state = yield select();
		const lang = state.get('lang');
		const message = lang === 'vi' ? vi : en;

		if (error.statusCode === 401 && (error.code === 'INVALID_TOKEN' || error.code === 'AUTHORIZATION_REQUIRED')) {
			// Access token has expired
			if (AuthStorage.loggedIn) {
				yield put({ type: 'LOGOUT_SUCCESS' });
			}

			yield put({ type: REQUEST_ERROR, payload: message.access_token_expired });
			Router.pushRoute('/login');
		} else if (error.statusCode === 401 && error.code === 'ACCOUNT_DISABLED') {
			// Access token has expired
			if (AuthStorage.loggedIn) {
				yield put({ type: 'LOGOUT_SUCCESS' });
			}

			yield put({ type: REQUEST_ERROR, payload: message.account_disabled });
			Router.pushRoute('/login');
		} else if (error.statusCode === 422) {
			yield put({ type: REQUEST_ERROR, payload: message.duplicate_email });
		} else {
			yield put({ type: REQUEST_ERROR, payload: message.error_system });
		}
	}

	return response;
}
