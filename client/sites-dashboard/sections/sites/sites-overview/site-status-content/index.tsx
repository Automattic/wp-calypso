import useRowMetadata from './hooks/use-row-metadata';
import SiteNameColumn from './site-name-column';
import SitePlansColumn from './site-plan-column';
import SiteStatsColumn from './site-stats-column';
import SiteStatusColumn from './site-status-column';
import type { AllowedTypes, SiteData } from '../types';

interface Props {
	rows: SiteData;
	type: AllowedTypes;
	isLargeScreen?: boolean;
	isFavorite?: boolean;
	siteError: boolean;
}

export default function SiteStatusContent( { rows, type, isLargeScreen = false }: Props ) {
	const metadata = useRowMetadata( rows, type, isLargeScreen );

	if ( type === 'stats' ) {
		return <SiteStatsColumn site={ rows.site.value } />;
	}

	if ( type === 'plan' ) {
		return <SitePlansColumn site={ rows.site.value } />;
	}

	return <SiteStatusColumn type={ type } rows={ rows } metadata={ metadata } />;
}
