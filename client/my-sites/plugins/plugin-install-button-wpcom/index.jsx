/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getAutomatedTransferStatus, getEligibility } from 'state/automated-transfer/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { initiateThemeTransfer } from 'state/themes/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { transferStates } from 'state/automated-transfer/constants';

export const WpcomPluginInstallButton = ( props ) => {
	const {
		translate,
		disabled,
		plugin,
		siteSlug,
		siteId,
		eligibilityData,
		navigateTo,
		initiateTransfer,
		transferState,
		trackButtonAction,
	} = props;

	if ( transferStates.COMPLETE === transferState ) {
		return null;
	}

	function installButtonAction( event ) {
		event.preventDefault();
		trackButtonAction( plugin.slug );
		const eligibilityHolds = get( eligibilityData, 'eligibilityHolds', [] );
		const eligibilityWarnings = get( eligibilityData, 'eligibilityWarnings', [] );

		const hasErrors = !! eligibilityHolds.length;
		const hasWarnings = !! eligibilityWarnings.length;
		if ( ! hasErrors && ! hasWarnings ) {
			// No need to show eligibility warnings page, initiate transfer immediately
			initiateTransfer( siteId, null, plugin.slug );
		} else {
			// Show eligibility warnings before proceeding
			navigateTo( `/plugins/${ plugin.slug }/eligibility/${ siteSlug }` );
		}
	}

	return (
		<Button onClick={ installButtonAction } primary={ true } disabled={ disabled }>
			{ translate( 'Install' ) }
		</Button>
	);
};

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );

	return {
		siteId: site.ID,
		siteSlug: site.slug,
		eligibilityData: getEligibility( state, site.ID ),
		transferState: getAutomatedTransferStatus( state, site.ID ),
	};
};

const mapDispatchToProps = {
	initiateTransfer: initiateThemeTransfer,
	trackButtonAction: ( plugin ) =>
		recordTracksEvent( 'calypso_automated_transfer_click_plugin_install', { plugin } ),
};

const withNavigation = ( WrappedComponent ) => ( props ) => (
	<WrappedComponent { ...{ ...props, navigateTo: page } } />
);

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( withNavigation( localize( WpcomPluginInstallButton ) ) );
