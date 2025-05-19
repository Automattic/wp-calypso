import { useTranslate } from 'i18n-calypso';

export const usePhpVersions = () => {
	const translate = useTranslate();

	// PHP 8.3 is now the default recommended version
	const recommendedValue = '8.3';
	const recommendedLabel = translate( '%s (recommended)', {
		args: recommendedValue,
		comment: 'PHP Version for a version switcher',
	} );

	const phpVersions = [
		{
			label: '7.3',
			value: '7.3',
			disabled: true, // EOL 6th December, 2021
		},
		{
			label: translate( '%s (deprecated)', {
				args: '7.4',
				comment: 'PHP Version for a version switcher',
			} ),
			value: '7.4',
			disabled: true, // EOL 1st July, 2024
		},
		{
			label: '8.0',
			value: '8.0',
			disabled: true, // EOL 26th November, 2023
		},
		{
			label: translate( '%s (deprecated)', {
				args: '8.1',
				comment: 'PHP Version for a version switcher',
			} ),
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
