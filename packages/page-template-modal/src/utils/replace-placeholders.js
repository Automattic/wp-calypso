/**
 * External dependencies
 */
import { _x } from '@wordpress/i18n';

const PLACEHOLDER_DEFAULTS = {
	Address: _x( '123 Main St', 'default address', __i18n_text_domain__ ),
	Phone: _x( '555-555-5555', 'default phone number', __i18n_text_domain__ ),
	CompanyName: _x( 'Your Company Name', 'default company name', __i18n_text_domain__ ),
	Vertical: _x( 'Business', 'default vertical name', __i18n_text_domain__ ),
};

const KEY_MAP = {
	CompanyName: 'title',
	Address: 'address',
	Phone: 'phone',
	Vertical: 'vertical',
};

const replacePlaceholders = ( pageContent, siteInformation = {} ) => {
	if ( ! pageContent ) {
		return '';
	}

	return pageContent.replace( /{{(\w+)}}/g, ( match, placeholder ) => {
		const defaultValue = PLACEHOLDER_DEFAULTS[ placeholder ];
		const key = KEY_MAP[ placeholder ];
		return siteInformation[ key ] || defaultValue || placeholder;
	} );
};

export default replacePlaceholders;
