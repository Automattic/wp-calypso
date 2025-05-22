import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import { siteWordPressVersionQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import { canUpdateWordPressVersion } from './utils';
import type { Site } from '../../data/types';

export default function WordPressSettingsSummary( { site }: { site: Site } ) {
	const { data: versionTag } = useQuery( {
		...siteWordPressVersionQuery( site.slug ),
		enabled: canUpdateWordPressVersion( site ),
	} );

	const wpVersion = getFormattedWordPressVersion( site, versionTag );
	if ( ! wpVersion ) {
		return null;
	}

	const badges = [
		{
			text: wpVersion,
			intent: versionTag === 'beta' ? ( 'warning' as const ) : ( 'success' as const ),
		},
	];

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/wordpress` }
			title="WordPress"
			density="medium"
			decoration={ <Icon icon={ wordpress } /> }
			badges={ badges }
		/>
	);
}
