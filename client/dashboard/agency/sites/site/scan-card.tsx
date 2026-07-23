import { __ } from '@wordpress/i18n';
import { shield } from '@wordpress/icons';
import OverviewCard from '../../../components/overview-card';
import { ScanCardContent } from '../../../sites/overview-scan-card';
import type { AgencySite } from '@automattic/api-core';

export default function ScanCard( { site, siteSlug }: { site: AgencySite; siteSlug: string } ) {
	if ( ! site.has_scan ) {
		return (
			<OverviewCard
				icon={ shield }
				title={ __( 'Last scan' ) }
				heading={ __( 'Not active' ) }
				description={ __( 'Scan isn’t enabled for this site.' ) }
			/>
		);
	}

	return <ScanCardContent siteId={ site.blog_id } scanUrl={ `/sites/${ siteSlug }/scan` } />;
}
