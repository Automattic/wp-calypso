import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { code } from '@wordpress/icons';
import { getPHPVersions } from 'calypso/data/php-versions';
import { sitePHPVersionQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canUpdatePHPVersion } from './utils';
import type { Site } from '../../data/types';

export default function PHPSettingsSummary( { site }: { site: Site } ) {
	const { data: version } = useQuery( {
		...sitePHPVersionQuery( site.slug ),
		enabled: canUpdatePHPVersion( site ),
	} );

	const { recommendedValue } = getPHPVersions();

	const badge = {
		text: version ?? __( 'Managed' ),
		intent:
			version && version !== recommendedValue ? ( 'warning' as const ) : ( 'success' as const ),
	};

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/php` }
			title="PHP"
			density="medium"
			decoration={ <Icon icon={ code } /> }
			badges={ [ badge ] }
		/>
	);
}
