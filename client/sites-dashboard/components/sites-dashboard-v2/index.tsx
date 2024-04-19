import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import DotcomSitesDataViews from './sites-dataviews';

// todo use this A4A styles until we extract them as common styles in the ItemsDashboard component
import 'calypso/a8c-for-agencies/sections/sites/sites-dashboard/style.scss';

type Props = {
	sites: SiteExcerptData[];
	isLoading: boolean;
};

const SitesDashboardV2 = ( { sites, isLoading }: Props ) => {
	const { __ } = useI18n();

	return (
		<main>
			<DocumentHead title={ __( 'Sites' ) } />
			<DotcomSitesDataViews sites={ sites } isLoading={ isLoading } />
		</main>
	);
};

export default SitesDashboardV2;
