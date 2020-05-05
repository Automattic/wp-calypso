/**
 * External dependencies
 *
 */

import { connect } from 'react-redux';
import { filter, matches } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { getPlugins, isRequestingForSites } from 'state/plugins/installed/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	mailChimpSettings,
	isRequestingSettings,
} from 'woocommerce/state/sites/settings/mailchimp/selectors';
import MailChimpGettingStarted from './getting-started';
import MailChimpSetup from './setup-mailchimp';
import MailChimpDashboard from './mailchimp_dashboard';
import QueryMailChimpSettings from 'woocommerce/state/sites/settings/mailchimp/querySettings';

class MailChimp extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			setupWizardStarted: !! props.startWizard,
			wizardCompleted: false,
		};
	}

	startWizard = () => {
		this.setState( { setupWizardStarted: true } );
	};

	closeWizard = ( status ) => {
		this.setState( { setupWizardStarted: false, wizardCompleted: 'wizard-completed' === status } );
	};

	closeSetupFinishNotice = () => {
		this.setState( { wizardCompleted: false } );
	};

	render() {
		const {
			dashboardView,
			hasMailChimp,
			isRequestingMailChimpSettings,
			isRequestingPlugins,
			onChange,
			siteId,
			site,
			settings,
		} = this.props;
		const { setupWizardStarted } = this.state;
		const isRequestingData = isRequestingMailChimpSettings || isRequestingPlugins;
		const mailChimpIsReady = ! isRequestingData && settings && settings.active_tab === 'sync';
		const gettingStarted =
			! setupWizardStarted && ! isRequestingData && settings && settings.active_tab !== 'sync';

		// TODO Eventually re-implement a new dashboard widget for extension
		// that accomodates sites without the plugin installed
		if ( dashboardView || ! hasMailChimp ) {
			return null;
		}

		return (
			<div className="mailchimp">
				<QueryMailChimpSettings siteId={ siteId } />
				{ ( isRequestingData || gettingStarted ) && (
					<MailChimpGettingStarted
						siteId={ siteId }
						site={ site }
						isPlaceholder={ isRequestingData }
						onClick={ this.startWizard }
					/>
				) }
				{ mailChimpIsReady && (
					<MailChimpDashboard
						siteId={ siteId }
						wizardCompleted={ this.state.wizardCompleted }
						onChange={ onChange }
						onNoticeExit={ this.closeSetupFinishNotice }
					/>
				) }
				{ setupWizardStarted && (
					<MailChimpSetup
						hasMailChimp={ hasMailChimp }
						settings={ settings }
						siteId={ siteId }
						onClose={ this.closeWizard }
					/>
				) }
			</div>
		);
	}
}

MailChimp.propTypes = {
	siteId: PropTypes.number.isRequired,
	hasMailChimp: PropTypes.bool,
	isRequestingPlugins: PropTypes.bool,
	isRequestingMailChimpSettings: PropTypes.bool,
	onChange: PropTypes.func,
	settings: PropTypes.object,
	startWizard: PropTypes.bool,
	dashboardView: PropTypes.bool,
};

function mapStateToProps( state ) {
	const mailChimpId = 'mailchimp-for-woocommerce/mailchimp-woocommerce';
	const siteId = getSelectedSiteId( state );
	const isRequestingPlugins = isRequestingForSites( state, [ siteId ] );
	const isRequestingMailChimpSettings = isRequestingSettings( state, siteId );
	const sitePlugins = getPlugins( state, [ siteId ] );
	const mailChimp = filter( sitePlugins, matches( { id: mailChimpId, active: true } ) );
	const hasMailChimp = !! mailChimp.length;
	const settings = mailChimpSettings( state, siteId );
	return {
		siteId,
		hasMailChimp,
		isRequestingPlugins,
		isRequestingMailChimpSettings,
		settings: settings || {},
	};
}

export default connect( mapStateToProps )( localize( MailChimp ) );
