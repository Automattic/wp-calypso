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

const replacePlaceholders = (
	pageContent: string,
	siteInformation: Record< string, string > = {}
): string => {
	if ( ! pageContent ) {
		return '';
	}

	return pageContent.replace( /{{(\w+)}}/g, ( _match, placeholder ) => {
		const defaultValue = isObjKey( placeholder, PLACEHOLDER_DEFAULTS )
			? PLACEHOLDER_DEFAULTS[ placeholder ]
			: '';
		const key = isObjKey( placeholder, KEY_MAP ) ? KEY_MAP[ placeholder ] : '';
		return siteInformation[ key ] || defaultValue || placeholder;
	} );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isObjKey< T extends object >( key: any, obj: T ): key is keyof T {
	return key in obj;
}

export default replacePlaceholders;
