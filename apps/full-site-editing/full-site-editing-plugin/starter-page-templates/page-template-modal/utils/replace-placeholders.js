/**
 * External dependencies
 */
import { _x } from '@wordpress/i18n';

const PLACEHOLDER_DEFAULTS = {
	Address: _x( '123 Main St', 'default address', 'full-site-editing' ),
	Phone: _x( '555-555-5555', 'default phone number', 'full-site-editing' ),
	CompanyName: _x( 'Your Company Name', 'default company name', 'full-site-editing' ),
	Vertical: _x( 'Business', 'default vertical name', 'full-site-editing' ),
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
