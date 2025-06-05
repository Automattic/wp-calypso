import { __, sprintf } from '@wordpress/i18n';

export const getPHPVersions = () => {
	// PHP 8.3 is now the default recommended version
	const recommendedValue = '8.3';
	// translators: PHP Version for a version switcher
	const recommendedLabel = sprintf( __( '%s (recommended)' ), recommendedValue );

	const phpVersions = [
		{
			label: '7.3',
			value: '7.3',
			disabled: true, // EOL 6th December, 2021
		},
		{
			// translators: PHP Version for a version switcher
			label: sprintf( __( '%s (deprecated)' ), '7.4' ),
			value: '7.4',
			disabled: true, // EOL 1st July, 2024
		},
		{
			label: '8.0',
			value: '8.0',
			disabled: true, // EOL 26th November, 2023
		},
		{
			// translators: PHP Version for a version switcher
			label: sprintf( __( '%s (deprecated)' ), '8.1' ),
			value: '8.1',
			disabled: false, // EOL 31st December, 2025
		},
		{
			label: '8.2',
			value: '8.2',
			disabled: false, // EOL 31st December, 2026
		},
		{
			label: recommendedLabel,
			value: recommendedValue,
			disabled: false, // EOL 31st December, 2027
		},
	];

	return { recommendedValue, phpVersions };
};
