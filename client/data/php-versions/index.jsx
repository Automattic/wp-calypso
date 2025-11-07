import { __, sprintf } from '@wordpress/i18n';

export const getPHPVersions = ( siteId ) => {
	// PHP 8.3 is the default recommended version
	const recommendedValue = '8.3';
	// translators: PHP Version for a version switcher
	const recommendedLabel = sprintf( __( '%s (Recommended)' ), recommendedValue );
	const PHP81BrokenSites = [ 64254301, 181414687 ];

	const phpVersions = [
		{
			// translators: PHP Version for a version switcher
			label: sprintf( __( '%s (Deprecated)' ), '8.1' ),
			value: '8.1',
			disabled: ! PHP81BrokenSites.includes( siteId ?? 0 ), // EOL 31 December 2025
		},
		{
			label: '8.2',
			value: '8.2',
			disabled: false, // EOL 31 December 2026
		},
		{
			label: recommendedLabel,
			value: recommendedValue,
			disabled: false, // EOL 31 December 2027
		},
		{
			label: '8.4',
			value: '8.4',
			disabled: false, // EOL 31 December 2028
		},
	];

	return { recommendedValue, phpVersions };
};
