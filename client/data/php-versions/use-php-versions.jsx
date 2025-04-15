import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const usePhpVersions = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	// 10% of sites will have a recommended PHP version of 8.3. These sites are transferring to 8.3 by default.
	// 243386763 is the first site of the list.
	const isPhp83Default = siteId >= 243386763 && siteId % 10 === 0;
	const recommendedValue = isPhp83Default ? '8.3' : '8.2';
	const recommendedLabel = translate( '%s (recommended)', {
		args: isPhp83Default ? '8.3' : '8.2',
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
			label: '8.1',
			value: '8.1',
		},
		{
			label: isPhp83Default ? '8.2' : recommendedLabel,
			value: '8.2',
		},
		{
			label: isPhp83Default ? recommendedLabel : '8.3',
			value: '8.3',
		},
	];

	return { recommendedValue, phpVersions };
};
