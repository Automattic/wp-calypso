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
import MainComponent from 'calypso/components/main';
import HeaderCake from 'calypso/components/header-cake';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

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
