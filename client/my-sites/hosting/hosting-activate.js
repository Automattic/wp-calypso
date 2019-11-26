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
	const getBackUrl = () => {
		return `/hosting-config/${ siteSlug }`;
	};

	const pluginTransferInitiate = () => {
		initiateTransfer( siteId, null, null );
		page( getBackUrl() );
	};

	return (
		<MainComponent>
			<PageViewTracker
				path="/hosting-config/activate/:site"
				title="Hosting Configuration > Activate"
			/>
			<HeaderCake isCompact={ true } backHref={ getBackUrl() }>
				{ translate( 'Activate Hosting Features' ) }
			</HeaderCake>
			<EligibilityWarnings onProceed={ pluginTransferInitiate } backUrl={ getBackUrl() } />
		</MainComponent>
	);
};

const mapStateToProps = state => {
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
