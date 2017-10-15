/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import { filter, matches } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { getPlugins } from 'state/plugins/installed/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isRequestingForSites } from 'state/plugins/installed/selectors';

import { mailchimpSettings, isRequestingSettings } from 'woocommerce/state/sites/settings/email/selectors';
import MailChimpGettingStarted from './getting-started';
import MailChimpSetup from './setup-mailchimp';
import MailChimpDashboard from './mailchimp_dashboard';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import QueryMailChimpSettings from 'woocommerce/state/sites/settings/email/querySettings';

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
		const { hasMailChimp, isRequestingMailChimpSettings, isRequestingPlugins, siteId, settings, translate } = this.props;
		const className = classNames( 'mailchimp__main', { mailchimp__loading: isRequestingMailChimpSettings } );
		const { setupWizardStarted } = this.state;
		const isRequestingData = ( isRequestingMailChimpSettings || isRequestingPlugins );
		const mailChimpIsReady = ! isRequestingData &&
			( settings && settings.active_tab === 'sync' );
		const gettingStarted = ! setupWizardStarted && ! isRequestingData &&
			( settings && settings.active_tab !== 'sync' );
		return (
			<div className={ className }>
				<QueryJetpackPlugins siteIds={ [ siteId ] } />
				<QueryMailChimpSettings siteId={ siteId } />
				{ isRequestingData && <Card>{ translate( 'MailChimp is Loading' ) }</Card> }
				{ mailChimpIsReady && <MailChimpDashboard siteId={ siteId } onClick={ this.startWizard } /> }
				{ gettingStarted &&
						<MailChimpGettingStarted
							siteId={ siteId }
							isPlaceholder={ isRequestingMailChimpSettings }
							onClick={ this.startWizard }
						/>
				}
				{ setupWizardStarted &&
					<MailChimpSetup
							hasMailChimp={ hasMailChimp }
							settings={ settings }
							siteId={ siteId }
							onClose={ this.closeWizard }
						/>
				}
			</div>
		);
	}
}

MailChimp.propTypes = {
	siteId: PropTypes.number.isRequired,
	hasMailChimp: PropTypes.bool,
	isRequestingPlugins: PropTypes.bool,
	isRequestingMailChimpSettings: PropTypes.bool,
	settings: PropTypes.object,
};

const MailChimpConnected = connect(
	( state ) => {
		const mailChimpId = 'mailchimp-for-woocommerce/mailchimp-woocommerce';
		const siteId = getSelectedSiteId( state );
		const isRequestingPlugins = isRequestingForSites( state, [ siteId ] );
		const isRequestingMailChimpSettings = isRequestingSettings( state, siteId );
		const sitePlugins = getPlugins( state, [ siteId ] );
		const mailChimp = filter( sitePlugins, matches( { id: mailChimpId } ) );
		const hasMailChimp = !! mailChimp.length;
		const settings = mailchimpSettings( state, siteId );
		return {
			siteId,
			hasMailChimp,
			isRequestingPlugins,
			isRequestingMailChimpSettings,
			settings: settings || {},
		};
	}
)( MailChimp );

export default localize( MailChimpConnected );
