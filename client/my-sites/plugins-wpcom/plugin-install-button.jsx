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
import { getSelectedSite } from 'state/ui/selectors';
import { getEligibility } from 'state/automated-transfer/selectors';
import { initiateThemeTransfer } from 'state/themes/actions';

export const WpcomPluginInstallButton = props => {
	const {
		translate,
		disabled,
		plugin,
		siteSlug,
		siteId,
		eligibilityData,
		navigateTo,
		initiateTransfer
	} = props;

	function installButtonAction( event ) {
		event.preventDefault();

		const hasErrors = !! get( eligibilityData, 'eligibilityHolds', [] ).length;
		const hasWarnings = !! get( eligibilityData, 'eligibilityWarnings', [] ).length;

		if ( ! hasErrors && ! hasWarnings ) {
			// No need to show eligibility warnings page, initiate transfer immediately
			initiateTransfer( siteId, null, plugin.slug );
		} else {
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
		eligibilityData: getEligibility( state, site.ID )
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
