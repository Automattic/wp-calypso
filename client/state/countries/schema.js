/**
 * Internal Dependencies
 */
import { DOMAIN, SMS, PAYMENT } from './constants';

const items = {

	type: 'array',
	items: {
		type: 'object',
		required: [ 'code', 'name' ],
		properties: {
			code: { type: 'string', pattern: '^[A-Z]{2}$' },
			name: { type: 'string' },
			numeric_code: { type: 'string', pattern: '^\\+[0-9]{1,4}$' },
			country_name: { type: 'string' }
		}
	}
};

export const countriesSchema = {
	type: 'object',
	properties: {
		[ DOMAIN ]: items,
		[ SMS ]: items,
		[ PAYMENT ]: items
	}
};
