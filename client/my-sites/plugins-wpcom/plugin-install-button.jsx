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
import Button from 'components/button';
import { getAutomatedTransferStatus } from 'state/automated-transfer/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getEligibility } from 'state/automated-transfer/selectors';
import { initiateThemeTransfer } from 'state/themes/actions';
import { transferStates } from 'state/automated-transfer/constants';
import analytics from 'lib/analytics';

export const WpcomPluginInstallButton = props => {
	const {
		translate,
		disabled,
		plugin,
		siteSlug,
		siteId,
		eligibilityData,
		navigateTo,
		initiateTransfer,
		transferState
	} = props;

	if ( transferStates.COMPLETE === transferState ) {
		return null;
	}

	function installButtonAction( event ) {
		event.preventDefault();

		const eligibilityHolds = get( eligibilityData, 'eligibilityHolds', [] );
		const eligibilityWarnings = get( eligibilityData, 'eligibilityWarnings', [] );

		const hasErrors = !! eligibilityHolds.length;
		const hasWarnings = !! eligibilityWarnings.length;

		if ( ! hasErrors && ! hasWarnings ) {
			// No need to show eligibility warnings page, initiate transfer immediately
			initiateTransfer( siteId, null, plugin.slug );
		} else {
			analytics.tracks.recordEvent( 'calypso_automatic_transfer_plugin_install_ineligible',
				{ eligibilityHolds: eligibilityHolds.join( ', ' ),
					eligibilityWarnings: eligibilityWarnings.join( ', ' ),
					plugin_slug: plugin.slug } );

			// Show eligibility warnings before proceeding
			navigateTo( `/plugins/${ plugin.slug }/eligibility/${ siteSlug }` );
		}
	}

	return (
		<Button
			onClick={ installButtonAction }
			primary={ true }
			disabled={ disabled }
		>
			{ translate( 'Install' ) }
		</Button>
	);
};

const mapStateToProps = state => {
	const site = getSelectedSite( state );

	return {
		siteId: site.ID,
		siteSlug: site.slug,
		eligibilityData: getEligibility( state, site.ID ),
		transferState: getAutomatedTransferStatus( state, site.ID ),
	};
};

const mapDispatchToProps = {
	initiateTransfer: initiateThemeTransfer
};

const withNavigation = WrappedComponent => props => <WrappedComponent { ...{ ...props, navigateTo: page } } />;

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( withNavigation( localize( WpcomPluginInstallButton ) ) );
