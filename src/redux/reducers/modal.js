/* --------------------------------------------------------
* Author Trần Đức Tiến
* Email ductienas@gmail.com
* Phone 0972970075
*
* Created: 2018-02-13 10:56:54
*------------------------------------------------------- */

import { fromJS, Map } from 'immutable';

export const initialState = fromJS({
	login: {
		open: false,
		closable: false,
	},
	signUp: {
		open: false,
		closable: false,
	},
	flight: {
		open: false,
		closable: false,
		data: {},
		type: 'selling',
	},
	ticketPoster: {
		open: false,
		closable: false,
		type: 'selling',
	},
	userInfo: {
		open: false,
		closable: false,
	},
	editUserInfo: {
		open: false,
		closable: false,
	},
	rating: {
		open: false,
		closable: false,
	},
	editBuying: {
		open: false,
		closable: false,
	},
	editSelling: {
		open: false,
		closable: false,
	},
});

export default (state = initialState, action) => {
	switch (action.type) {
		case 'TOGGLE_LOGIN_MODAL':
			return state.update('login', () => {
				return {
					open: !!action.payload.open,
					closable: !!action.payload.closable,
				};
			});

		case 'TOGGLE_SIGNUP_MODAL':
			return state.update('signUp', () => {
				return {
					open: !!action.payload.open,
					closable: !!action.payload.closable,
				};
			});

		case 'TOGGLE_FLIGHT_MODAL':
			return state.update('flight', () => {
				return {
					open: !!action.payload.open,
					closable: !!action.payload.closable,
					type: action.payload.type,
					// data: action.payload.data,
					id: action.payload.id,
				};
			});

		case 'TOGGLE_TICKET_POSTER_MODAL':
			return state.update('ticketPoster', () => {
				return {
					open: !!action.payload.open,
					closable: !!action.payload.closable,
					type: action.payload.type,
				};
			});

		case 'TOGGLE_USER_INFO_MODAL':
			return state.update('userInfo', (userInfo) => {
				return { ...userInfo, ...action.payload };
			});

		case 'TOGGLE_EDIT_USER_INFO_MODAL':
			return state.update('editUserInfo', () => {
				return {
					open: !!action.payload.open,
					closable: !!action.payload.closable,
				};
			});

		case 'TOGGLE_RATING_MODAL':
			return state.update('rating', () => {
				return {
					open: !!action.payload.open,
					closable: !!action.payload.closable,
					receiverId: action.payload.receiverId,
				};
			});

		case 'TOGGLE_EDIT_BUYING_MODAL':
			return state.update('editBuying', (editBuying) => {
				return { ...editBuying, ...action.payload };
			});

		case 'TOGGLE_EDIT_SELLING_MODAL':
			return state.update('editSelling', (editSelling) => {
				return { ...editSelling, ...action.payload };
			});

		default:
			return state;
	}
};
