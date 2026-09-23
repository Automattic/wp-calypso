import { __, sprintf } from '@wordpress/i18n';

export const getPHPVersions = () => {
	const recommendedValue = '8.4';
	// translators: %s: PHP version number, e.g. "8.4", for a version switcher
	const recommendedLabel = sprintf( __( '%s (Recommended)' ), recommendedValue );

	const phpVersions = [
		{
			label: '8.2',
			value: '8.2',
			disabled: true, // Retired. Still listed so sites on it show their current version. EOL 31 December 2026
		},
		{
			label: '8.3',
			value: '8.3',
			disabled: false, // EOL 31 December 2027
		},
		{
			label: recommendedLabel,
			value: '8.4',
			disabled: false, // EOL 31 December 2028
		},
	];

	return { recommendedValue, phpVersions };
};
