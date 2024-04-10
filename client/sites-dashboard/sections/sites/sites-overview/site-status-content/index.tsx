import SiteLastPublishColumn from './site-last-publish-column';
import SitePlansColumn from './site-plan-column';
import SiteStatsColumn from './site-stats-column';
import SiteTypeColumn from './site-type-column';
import type { AllowedTypes, SiteData } from '../types';

interface Props {
	rows: SiteData;
	type: AllowedTypes;
	isLargeScreen?: boolean;
}

export default function SiteStatusContent( { rows, type, isLargeScreen }: Props ) {
	if ( type === 'stats' ) {
		return <SiteStatsColumn site={ rows.site.value } />;
	} else if ( type === 'plan' ) {
		return <SitePlansColumn site={ rows.site.value } />;
	} else if ( type === 'type' ) {
		return <SiteTypeColumn site={ rows.site.value } />;
	} else if ( type === 'last_publish' ) {
		return <SiteLastPublishColumn site={ rows.site.value } />;
	}
}
