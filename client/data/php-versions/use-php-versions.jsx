import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const usePhpVersions = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	// 10% of sites will have a recommended PHP version of 8.2.
	const is10Percent = siteId % 10 === 0;
	const recommendedValue = is10Percent ? '8.2' : '8.1';
	console.log( siteId, recommendedValue );
	const label = translate( '%s (recommended)', {
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
			label: '8.1',
			value: '8.1',
		},
		{
			label: '8.2',
			value: '8.2',
		},
		{
			label: '8.3',
			value: '8.3',
		},
	];

	if ( is10Percent ) {
		phpVersions[ 4 ].label = label;
	} else {
		phpVersions[ 3 ].label = label;
	}

	return { recommendedValue, phpVersions };
};
