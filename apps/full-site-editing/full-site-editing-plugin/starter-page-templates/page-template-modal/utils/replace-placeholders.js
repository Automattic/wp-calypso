const __ = a => a;

const PLACEHOLDER_DEFAULTS = {
	Address: '123 Main St',
	Phone: '555-555-5555',
	CompanyName: __( 'Your Company Name' ),
	Vertical: __( 'Business' ),
};

const KEY_MAP = {
	CompanyName: 'title',
	Address: 'address',
	Phone: 'phone',
	Vertical: 'vertical',
};

const replacePlaceholders = ( pageContent, siteInformation = {} ) => {
	return pageContent.replace( /{{(\w+)}}/g, ( match, placeholder ) => {
		const defaultValue = PLACEHOLDER_DEFAULTS[ placeholder ];
		const key = KEY_MAP[ placeholder ];
		return siteInformation[ key ] || defaultValue || placeholder;
	} );
};

export default replacePlaceholders;
