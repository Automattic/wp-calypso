import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageViewTracker from '../stats-page-view-tracker';
import StatsPurchaseWizard from './stats-purchase-wizard';

const StatsPurchasePage = () => {
	const translate = useTranslate();

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isPurchaseEnabled = config.isEnabled( 'stats/paid-stats' );

	if ( ! isPurchaseEnabled ) {
		page( '/stats', '/stats/day' );
	}

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/participation/:site" title="Stats > Purchase" />
			<div className="stats">
				{ isPurchaseEnabled && <StatsPurchaseWizard siteSlug={ siteSlug } /> }
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsPurchasePage;
