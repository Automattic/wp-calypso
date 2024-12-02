import { useTranslate } from 'i18n-calypso';

export const usePhpVersions = () => {
	const translate = useTranslate();
	const recommendedValue = '8.2';

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
			label: '8.1',
			value: '8.1',
		},
		{
			label: translate( '%s (recommended)', {
				args: '8.2',
				comment: 'PHP Version for a version switcher',
			} ),
			value: recommendedValue,
		},
		{
			label: '8.3',
			value: '8.3',
		},
	];

	return { recommendedValue, phpVersions };
};
