import { localize } from 'i18n-calypso';
import page from 'page';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import HeaderCake from 'calypso/components/header-cake';
import MainComponent from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { initiateAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const HostingActivate = ( { initiateTransfer, siteId, siteSlug, translate } ) => {
	const backUrl = `/hosting-config/${ siteSlug }`;

	const transferInitiate = ( { geo_affinity = '' } ) => {
		initiateTransfer( siteId, { geoAffinity: geo_affinity, context: 'hosting' } );
		page( backUrl );
	};

	return (
		<MainComponent>
			<PageViewTracker
				path="/hosting-config/activate/:site"
				title="Hosting Configuration > Activate"
			/>
			<HeaderCake isCompact={ false } backHref={ backUrl }>
				{ translate( 'Activate Hosting Features' ) }
			</HeaderCake>
			<EligibilityWarnings
				className="hosting__activating-warnings"
				onProceed={ transferInitiate }
				backUrl={ backUrl }
				showDataCenterPicker={ true }
			/>
		</MainComponent>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	return {
		siteId,
		siteSlug,
	};
};

const mapDispatchToProps = {
	initiateTransfer: initiateAtomicTransfer,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( HostingActivate ) );
