import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import { siteWordPressVersionQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canUpdateWordPressVersion } from '../../utils/site-features';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export function useCanRenderWordPressSettingsSummary( { site }: { site: Site } ) {
	const { data: wpVersionTag } = useQuery( {
		...siteWordPressVersionQuery( site?.slug ),
		enabled: canUpdateWordPressVersion( site ),
	} );

	const wpVersion = getFormattedWordPressVersion( site, wpVersionTag );

	return {
		show: !! wpVersion,
		props: {
			site,
			wpVersion,
			wpVersionTag,
		},
	};
}

export default function WordPressSettingsSummary( {
	site,
	wpVersion,
	wpVersionTag,
	density,
}: ReturnType< typeof useCanRenderWordPressSettingsSummary >[ 'props' ] & {
	density?: Density;
} ) {
	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/wordpress` }
			title="WordPress"
			density={ density }
			decoration={ <Icon icon={ wordpress } /> }
			badges={ [
				{
					text: wpVersion,
					intent: wpVersionTag === 'beta' ? ( 'warning' as const ) : ( 'success' as const ),
				},
			] }
		/>
	);
}
