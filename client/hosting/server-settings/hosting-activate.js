import page from '@automattic/calypso-router';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import HeaderCake from 'calypso/components/header-cake';
import MainComponent from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const HostingActivate = ( { initiateTransfer, siteId, siteSlug, translate } ) => {
	const backUrl = `/hosting-config/${ siteSlug }`;

	const transferInitiate = ( { geo_affinity = '' } ) => {
		initiateTransfer( siteId, null, null, geo_affinity, 'hosting' );
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
				showDataCenterPicker
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
	initiateTransfer: initiateThemeTransfer,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( HostingActivate ) );
