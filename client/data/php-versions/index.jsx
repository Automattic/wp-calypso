import { __, sprintf } from '@wordpress/i18n';

export const getPHPVersions = ( siteId ) => {
	// 1% of sites will have a recommended PHP version of 8.4. These sites are transferring to 8.4 by default.
	// 251762970 is the first site of the list.
	const isPhp84Default = siteId && siteId >= 251762970 && siteId % 100 === 0;

	// PHP 8.3 is the default recommended version, 8.4 is the new recommended version for some sites.
	const recommendedValue = isPhp84Default ? '8.4' : '8.3';
	// translators: PHP Version for a version switcher
	const recommendedLabel = sprintf( __( '%s (Recommended)' ), recommendedValue );

	const phpVersions = [
		{
			label: '8.2',
			value: '8.2',
			disabled: false, // EOL 31 December 2026
		},
		{
			label: isPhp84Default ? '8.3' : recommendedLabel,
			value: '8.3',
			disabled: false, // EOL 31 December 2027
		},
		{
			label: isPhp84Default ? recommendedLabel : '8.4',
			value: '8.4',
			disabled: false, // EOL 31 December 2028
		},
	];

	return { recommendedValue, phpVersions };
};
