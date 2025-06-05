import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import { siteWordPressVersionQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canUpdateWordPressVersion } from '../../utils/site-features';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function WordPressSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
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
			density={ density }
			decoration={ <Icon icon={ wordpress } /> }
			badges={ badges }
		/>
	);
}
