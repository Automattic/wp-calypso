/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import MainComponent from 'components/main';
import HeaderCake from 'components/header-cake';
import EligibilityWarnings from 'blocks/eligibility-warnings';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { initiateThemeTransfer } from 'state/themes/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

const HostingActivate = ( { initiateTransfer, siteId, siteSlug, translate } ) => {
	const backUrl = `/hosting-config/${ siteSlug }`;

	const transferInitiate = () => {
		initiateTransfer( siteId, null, null );
		page( backUrl );
	};

	return (
		<MainComponent>
			<PageViewTracker
				path="/hosting-config/activate/:site"
				title="Hosting Configuration > Activate"
			/>
			<HeaderCake isCompact={ true } backHref={ backUrl }>
				{ translate( 'Activate Hosting Features' ) }
			</HeaderCake>
			<EligibilityWarnings onProceed={ transferInitiate } backUrl={ backUrl } />
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
