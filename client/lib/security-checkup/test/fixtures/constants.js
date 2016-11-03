import { actions } from '../../constants';

const EMAIL = 'test@example.com',
	PHONE_COUNTRY = 'US',
	PHONE_COUNTRY_NUMERIC = '+1',
	PHONE_NUMBER = '8772738550',
	PHONE_NUMBER_FULL = PHONE_COUNTRY_NUMERIC + PHONE_NUMBER,
	PHONE_OBJECT = {
		countryCode: PHONE_COUNTRY,
		countryNumericCode: PHONE_COUNTRY_NUMERIC,
		number: PHONE_NUMBER,
		numberFull: PHONE_NUMBER_FULL,
		isValidated: false,
	};

export default {
	DUMMY_EMAIL: EMAIL,
	DUMMY_PHONE_COUNTRY: PHONE_COUNTRY,
	DUMMY_PHONE_NUMBER: PHONE_NUMBER,
	DUMMY_PHONE: PHONE_OBJECT,
	DUMMY_UPDATE_EMAIL_RESPONSE: {
		success: true
	},
	DUMMY_DELETE_EMAIL_RESPONSE: {
		success: true
	},
	DUMMY_UPDATE_PHONE_RESPONSE: {
		success: true
	},
	DUMMY_DELETE_PHONE_RESPONSE: {
		success: true
	},

	DUMMY_ACCOUNT_RECOVERY_RESPONSE: {
		email: EMAIL,
		email_validated: false,
		phone: {
			country_code: PHONE_COUNTRY,
			country_numeric_code: PHONE_COUNTRY_NUMERIC,
			number: PHONE_NUMBER,
			number_full: PHONE_NUMBER_FULL
		},
		phone_validated: false,
	},
	DUMMY_STORE_EMAIL_OBJECT_LOADING: {
		loading: true,
		data: {}
	},
	DUMMY_STORE_PHONE_OBJECT_LOADING: {
		loading: true,
		data: {}
	},
	DUMMY_STORE_EMAIL_OBJECT: {
		loading: false,
		data: {
			email: EMAIL,
			isValidated: false,
		}
	},
	DUMMY_STORE_PHONE_OBJECT: {
		loading: false,
		data: PHONE_OBJECT
	},
	DISPATCH_UPDATE_ACCOUNT_RECOVERY_EMAIL: {
		type: actions.UPDATE_ACCOUNT_RECOVERY_EMAIL,
		email: EMAIL
	},
	DISPATCH_RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL: {
		type: actions.RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL,
		email: EMAIL,
	},
	DISPATCH_DELETE_ACCOUNT_RECOVERY_EMAIL: {
		type: actions.DELETE_ACCOUNT_RECOVERY_EMAIL
	},
	DISPATCH_RECEIVE_DELETED_ACCOUNT_RECOVERY_EMAIL: {
		type: actions.RECEIVE_DELETED_ACCOUNT_RECOVERY_EMAIL
	},
	DISPATCH_DISMISS_ACCOUNT_RECOVERY_EMAIL_NOTICE: {
		type: actions.DISMISS_ACCOUNT_RECOVERY_EMAIL_NOTICE
	}
};
