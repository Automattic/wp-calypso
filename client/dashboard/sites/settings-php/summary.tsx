import { HostingFeatures } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { code } from '@wordpress/icons';
import { getPHPVersions } from 'calypso/data/php-versions';
import { sitePHPVersionQuery } from '../../app/queries/site-php-version';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { hasHostingFeature } from '../../utils/site-features';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function PHPSettingsSummary( { site, density }: { site: Site; density?: Density } ) {
	const { data: version } = useQuery( {
		...sitePHPVersionQuery( site.ID ),
		enabled: hasHostingFeature( site, HostingFeatures.PHP ),
	} );

	const { recommendedValue } = getPHPVersions();

	const getBadge = () => {
		if ( ! version ) {
			return [];
		}

		return [
			{
				text: version,
				intent: version !== recommendedValue ? ( 'warning' as const ) : ( 'success' as const ),
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
