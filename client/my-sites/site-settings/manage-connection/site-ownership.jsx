/** @format */

/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import accept from 'lib/accept';
import AuthorSelector from 'blocks/author-selector';
import Card from 'components/card';
import config from 'config';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Gravatar from 'components/gravatar';
import isJetpackSiteConnected from 'state/selectors/is-jetpack-site-connected';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import isJetpackUserMaster from 'state/selectors/is-jetpack-user-master';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import QueryJetpackUserConnection from 'components/data/query-jetpack-user-connection';
import SectionHeader from 'components/section-header';
import { changeOwner } from 'state/jetpack/connection/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isCurrentUserCurrentPlanOwner } from 'state/sites/plans/selectors';
import { isCurrentPlanPaid, isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { transferPlanOwnership } from 'state/sites/plans/actions';

class SiteOwnership extends Component {
	renderPlaceholder() {
		return (
			<Card className="manage-connection__card site-settings__card is-placeholder">
				<div />
			</Card>
		);
	}

	isUserExcludedFromSelector = user => {
		const { currentUser } = this.props;
		return (
			user.linked_user_ID === false ||
			user.linked_user_ID === currentUser.ID ||
			! includes( user.roles, 'administrator' )
		);
	};

	transformUser( user ) {
		return { ...user.linked_user_info, ...{ ID: user.ID } };
	}

	onSelectConnectionOwner = user => {
		const { translate } = this.props;

		accept(
			translate( 'Are you sure you want to transfer site ownership to {{user /}}?', {
				components: {
					user: <strong>{ user.display_name || user.name }</strong>,
				},
			} ),
			accepted => {
				if ( accepted ) {
					this.props.changeOwner( this.props.siteId, user.ID, user.name );
					this.props.recordTracksEvent( 'calypso_jetpack_connection_ownership_changed' );
				}
			},
			translate( 'Transfer ownership' ),
			translate( 'Keep ownership' ),
			{ isScary: true }
		);
	};

	onSelectPlanOwner = user => {
		const { translate } = this.props;

		accept(
			translate(
				'Are you absolutely sure you want to change the plan purchaser for this site to {{user /}}?',
				{
					components: {
						user: <strong>{ user.display_name || user.name }</strong>,
					},
				}
			),
			accepted => {
				if ( accepted ) {
					this.props.transferPlanOwnership( this.props.siteId, user.ID );
					this.props.recordTracksEvent( 'calypso_jetpack_plan_ownership_changed' );
				}
			},
			translate( 'Yes, change the plan purchaser' ),
			translate( 'Cancel' ),
			{ isScary: true }
		);
	};

	renderCurrentUser() {
		const { currentUser } = this.props;

		return (
			<div className="manage-connection__user">
				<Gravatar user={ currentUser } size={ 24 } />
				<span className="manage-connection__user-name">{ currentUser.display_name }</span>
			</div>
		);
	}

	renderCurrentUserDropdown() {
		const { currentUser, isConnectionTransferSupported, siteId } = this.props;
		if ( ! currentUser ) {
			return;
		}

		if ( ! config.isEnabled( 'jetpack/ownership-change' ) || ! isConnectionTransferSupported ) {
			return this.renderCurrentUser();
		}

		return (
			<div className="manage-connection__user-dropdown">
				<AuthorSelector
					siteId={ siteId }
					exclude={ this.isUserExcludedFromSelector }
					transformAuthor={ this.transformUser }
					allowSingleUser
					onSelect={ this.onSelectConnectionOwner }
				>
					{ this.renderCurrentUser() }
				</AuthorSelector>
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
			<Fragment>
				{ userIsMaster !== null && (
					<FormSettingExplanation>
						{ userIsMaster
							? translate( "You are the owner of this site's connection to WordPress.com." )
							: translate( "Somebody else owns this site's connection to WordPress.com." ) }
					</FormSettingExplanation>
				) }
				{ userIsMaster && this.renderCurrentUserDropdown() }
			</Fragment>
		);
	}

	renderPlanOwnerDropdown() {
		const { siteId } = this.props;

		return (
			<div className="manage-connection__user-dropdown">
				<AuthorSelector
					siteId={ siteId }
					exclude={ this.isUserExcludedFromSelector }
					transformAuthor={ this.transformUser }
					allowSingleUser
					onSelect={ this.onSelectPlanOwner }
				>
					{ this.renderCurrentUser() }
				</AuthorSelector>
			</div>
		);
	}

	renderPlanDetails() {
		const { currentUser, isCurrentPlanOwner, translate } = this.props;
		if ( ! currentUser ) {
			return;
		}

		return (
			<Fragment>
				{ isCurrentPlanOwner ? (
					this.renderPlanOwnerDropdown()
				) : (
					<FormSettingExplanation>
						{ translate( 'Somebody else is the plan purchaser for this site.' ) }
					</FormSettingExplanation>
				) }
			</Fragment>
		);
	}

	renderCardContent() {
		const { isPaidPlan, translate } = this.props;
		const showPlanSection = config.isEnabled( 'jetpack/ownership-change' ) && isPaidPlan;

		return (
			<Card>
				<FormFieldset className="manage-connection__formfieldset">
					<FormLabel>{ translate( 'Site owner' ) }</FormLabel>
					{ this.renderConnectionDetails() }
				</FormFieldset>

				{ showPlanSection && (
					<FormFieldset className="manage-connection__formfieldset has-divider is-top-only">
						<FormLabel>{ translate( 'Plan purchaser' ) }</FormLabel>
						{ this.renderPlanDetails() }
					</FormFieldset>
				) }
			</Card>
		);
	}

	render() {
		const { siteId, siteIsConnected, siteIsJetpack, translate } = this.props;

		return (
			<Fragment>
				{ siteIsJetpack && <QueryJetpackConnection siteId={ siteId } /> }
				{ siteIsJetpack && <QueryJetpackUserConnection siteId={ siteId } /> }

				<SectionHeader label={ translate( 'Site ownership' ) } />

				{ siteIsConnected === null ? this.renderPlaceholder() : this.renderCardContent() }
			</Fragment>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const isPaidPlan = isCurrentPlanPaid( state, siteId );
		const isCurrentPlanOwner = isPaidPlan && isCurrentUserCurrentPlanOwner( state, siteId );

		return {
			currentUser: getCurrentUser( state ),
			isConnectionTransferSupported: isJetpackMinimumVersion( state, siteId, '6.2' ),
			isCurrentPlanOwner,
			isPaidPlan,
			siteId,
			siteIsConnected: isJetpackSiteConnected( state, siteId ),
			siteIsJetpack: isJetpackSite( state, siteId ),
			siteIsInDevMode: isJetpackSiteInDevelopmentMode( state, siteId ),
			userIsMaster: isJetpackUserMaster( state, siteId ),
		};
	},
	{ changeOwner, recordTracksEvent, transferPlanOwnership }
)( localize( SiteOwnership ) );
