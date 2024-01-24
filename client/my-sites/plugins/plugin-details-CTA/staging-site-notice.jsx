import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Banner from 'calypso/components/banner';
import getProductionSiteForWpcomStaging from 'calypso/state/selectors/get-production-site-for-wpcom-staging';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function StagingSiteNotice( { plugin } ) {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const productionSite = useSelector( ( state ) =>
		getProductionSiteForWpcomStaging( state, siteId )
	);
	const productionSiteSlug = useSelector( ( state ) => getSiteSlug( state, productionSite?.ID ) );

	let url = '';
	if ( productionSiteSlug ) {
		url = `/plugins/${ plugin?.slug }/${ productionSiteSlug }`;
	}

	return (
		<>
			<Banner
				disableHref={ url === '' }
				icon="notice"
				href={ url }
				title={ translate( 'Plugins cannot be purchased on staging sites' ) }
				description={ translate( 'Subscribe to this plugin on your production site.' ) }
			/>
		</>
	);
}
