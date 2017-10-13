/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { filter, matches } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import MailChimpGettingStarted from './getting-started';
import MailChimpSetup from './setup-mailchimp';
import MailChimpDashboard from './mailchimp_dashboard';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import QueryMailChimpSettings from 'woocommerce/state/sites/settings/email/querySettings';
import { isRequestingForSites } from 'state/plugins/installed/selectors';
import { getPlugins } from 'state/plugins/installed/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { localize } from 'i18n-calypso';
import { mailchimpSettings, isRequestingSettings } from 'woocommerce/state/sites/settings/email/selectors';
import Card from 'components/card';

class MailChimp extends React.Component {

	constructor( props ) {
		super( props );
		this.state = {
			setupWizardStarted: false
		};
	}

	startWizard = () => {
		this.setState( { setupWizardStarted: true } );
	}

	closeWizard = () => {
		this.setState( { setupWizardStarted: false } );
	}

	render() {
		const { siteId, isRequestingMailChimpSettings, isRequestingPlugins } = this.props;
		const className = classNames( 'mailchimp__main', { mailchimp__loading: isRequestingMailChimpSettings } );
		const { setupWizardStarted } = this.state;
		const isRequestingData = ( isRequestingMailChimpSettings || isRequestingPlugins );
		const mailChimpIsReady = ! isRequestingData && ( this.props.settings.active_tab === 'sync' );
		return (
			<div className={ className }>
				<QueryJetpackPlugins siteIds={ [ siteId ] } />
				<QueryMailChimpSettings siteId={ siteId } />
				{ isRequestingData && <Card> Mailchimp is Loading </Card> }
				{ mailChimpIsReady && <MailChimpDashboard siteId={ siteId } onClick={ this.startWizard } /> }
				{ ! setupWizardStarted && ! isRequestingData && this.props.settings.active_tab !== 'sync' &&
					<MailChimpGettingStarted
							siteId={ siteId }
							isPlaceholder={ isRequestingMailChimpSettings }
							onClick={ this.startWizard } />
				}
				{ setupWizardStarted &&
					<MailChimpSetup
							hasMailChimp={ this.props.hasMailChimp }
							settings={ this.props.settings }
							siteId={ this.props.siteId }
							activeTab={ this.state.activeTab }
							onClose={ this.closeWizard } />
				}
			</div>
		);
	}
}

const MailChimpConnected = connect(
	( state ) => {
		const mailChimpId = 'mailchimp-for-woocommerce/mailchimp-woocommerce';
		const siteId = getSelectedSiteId( state );
		const isRequestingPlugins = isRequestingForSites( state, [ siteId ] );
		const isRequestingMailChimpSettings = isRequestingSettings( state, siteId );
		const sitePlugins = getPlugins( state, [ siteId ] );
		const mailChimp = filter( sitePlugins, matches( { id: mailChimpId } ) );
		const hasMailChimp = !! mailChimp.length;
		const version = hasMailChimp ? mailChimp[ 0 ].version : '0';
		return {
			siteId,
			sitePlugins,
			hasMailChimp,
			version,
			isRequestingPlugins,
			isRequestingMailChimpSettings,
			settings: mailchimpSettings( state, siteId ),
		};
	}
)( MailChimp );

export default localize( MailChimpConnected );
