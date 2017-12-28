/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'client/components/card';
import FormFieldset from 'client/components/forms/form-fieldset';
import FormLegend from 'client/components/forms/form-legend';
import FormSettingExplanation from 'client/components/forms/form-setting-explanation';
import Gravatar from 'client/components/gravatar';
import SectionHeader from 'client/components/section-header';
import QueryJetpackConnection from 'client/components/data/query-jetpack-connection';
import QueryJetpackUserConnection from 'client/components/data/query-jetpack-user-connection';
import { getCurrentUser } from 'client/state/current-user/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { isJetpackSite } from 'client/state/sites/selectors';
import {
	isJetpackSiteConnected,
	isJetpackSiteInDevelopmentMode,
	isJetpackUserMaster,
} from 'client/state/selectors';

class SiteOwnership extends Component {
	renderPlaceholder() {
		return (
			<Card className="manage-connection__card site-settings__card is-placeholder">
				<div />
			</Card>
		);
	}

	renderCurrentUser() {
		const { currentUser } = this.props;
		if ( ! currentUser ) {
			return;
		}

		return (
			<div className="manage-connection__user">
				<Gravatar user={ currentUser } size={ 24 } />
				<span className="manage-connection__user-name">{ currentUser.display_name }</span>
			</div>
		);
	}

	renderConnectionDetails() {
		const { siteIsConnected, siteIsInDevMode, translate, userIsMaster } = this.props;

		if ( siteIsConnected === false ) {
			return translate( 'The site is not connected.' );
		}

		if ( siteIsInDevMode ) {
			return (
				<FormSettingExplanation>
					{ translate(
						'Your site is in Development Mode, so it can not be connected to WordPress.com.'
					) }
				</FormSettingExplanation>
			);
		}

		return (
			<div>
				<FormSettingExplanation>
					{ userIsMaster
						? translate( "You are the owner of this site's connection to WordPress.com." )
						: translate( "Somebody else owns this site's connection to WordPress.com." ) }
				</FormSettingExplanation>
				{ userIsMaster && this.renderCurrentUser() }
			</div>
		);
	}

	renderCardContent() {
		const { translate } = this.props;

		return (
			<Card>
				<FormFieldset>
					<FormLegend>{ translate( 'Connection owner' ) }</FormLegend>
					{ this.renderConnectionDetails() }
				</FormFieldset>
			</Card>
		);
	}

	render() {
		const { siteId, siteIsConnected, siteIsJetpack, translate } = this.props;

		return (
			<div>
				{ siteIsJetpack && <QueryJetpackConnection siteId={ siteId } /> }
				{ siteIsJetpack && <QueryJetpackUserConnection siteId={ siteId } /> }

				<SectionHeader label={ translate( 'Site ownership' ) } />

				{ siteIsConnected === null ? this.renderPlaceholder() : this.renderCardContent() }
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		currentUser: getCurrentUser( state ),
		siteId,
		siteIsConnected: isJetpackSiteConnected( state, siteId ),
		siteIsJetpack: isJetpackSite( state, siteId ),
		siteIsInDevMode: isJetpackSiteInDevelopmentMode( state, siteId ),
		userIsMaster: isJetpackUserMaster( state, siteId ),
	};
} )( localize( SiteOwnership ) );
