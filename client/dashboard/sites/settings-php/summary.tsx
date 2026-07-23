import { HostingFeatures } from '@automattic/api-core';
import { sitePHPVersionQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { code } from '@wordpress/icons';
import { getPHPVersions } from 'calypso/data/php-versions';
import versionCompare from 'calypso/lib/version-compare';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { hasHostingFeature } from '../../utils/site-features';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function PHPSettingsSummary( { site, density }: { site: Site; density?: Density } ) {
	const { data: version } = useQuery( {
		...sitePHPVersionQuery( site.ID ),
		enabled: hasHostingFeature( site, HostingFeatures.PHP ),
	} );

	const { recommendedValue } = getPHPVersions( site.ID );

	const getBadge = () => {
		if ( ! version ) {
			return [];
		}

		return [
			{
				text: version,
				intent: versionCompare( version, recommendedValue, '>=' )
					? ( 'success' as const )
					: ( 'warning' as const ),
			},
		];
	};

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/php` }
			title="PHP"
			density={ density }
			decoration={ <Icon icon={ code } /> }
			badges={ getBadge() }
		/>
	);
}
