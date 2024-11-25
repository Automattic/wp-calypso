import { Card, FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import AuthorSelector from 'calypso/blocks/author-selector';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import QueryJetpackUserConnection from 'calypso/components/data/query-jetpack-user-connection';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import Gravatar from 'calypso/components/gravatar';
import { PanelHeading, PanelSection } from 'calypso/components/panel';
import accept from 'calypso/lib/accept';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { changeOwner } from 'calypso/state/jetpack/connection/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getJetpackConnectionOwner from 'calypso/state/selectors/get-jetpack-connection-owner';
import isJetpackSiteConnected from 'calypso/state/selectors/is-jetpack-site-connected';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import isJetpackUserConnectionOwner from 'calypso/state/selectors/is-jetpack-user-connection-owner';
import { transferPlanOwnership } from 'calypso/state/sites/plans/actions';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import OwnershipInformation from './ownership-information';

class SiteOwnership extends Component {
	renderPlaceholder() {
		return (
			<Card className="manage-connection__card site-settings__card is-placeholder">
				<div />
			</Card>
		);
	}

	isUserExcludedFromSelector = ( user ) => {
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

	onSelectConnectionOwner = ( user ) => {
		const { translate } = this.props;
		const message = (
			<Fragment>
				<p>
					{ translate( 'Are you sure you want to transfer site ownership to {{user /}}?', {
						components: {
							user: <strong>{ user.display_name || user.name }</strong>,
						},
					} ) }
				</p>
				<p>
					{ translate(
						'Note: you cannot undo this action. ' +
							'Going forward, only the new Site Owner can initiate a transfer.'
					) }
				</p>
			</Fragment>
		);

		accept(
			message,
			( accepted ) => {
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

	onSelectPlanOwner = ( user ) => {
		const { translate } = this.props;
		const message = (
			<Fragment>
				<p>
					{ translate( 'Are you sure you want to change the Plan Purchaser to {{user /}}?', {
						components: {
							user: <strong>{ user.display_name || user.name }</strong>,
						},
					} ) }
				</p>
				<p>
					{ translate(
						'Note: you cannot undo this action. ' +
							'Going forward, only the new Plan Purchaser can initiate a change.'
					) }
				</p>
			</Fragment>
		);

		accept(
			message,
			( accepted ) => {
				if ( accepted ) {
					this.props.transferPlanOwnership( this.props.siteId, user.linked_user_ID );
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
		const { currentUser, siteId } = this.props;
		if ( ! currentUser ) {
			return;
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
		const { connectionOwner, siteIsConnected, siteIsInDevMode, userIsConnectionOwner, translate } =
			this.props;

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
				{ userIsConnectionOwner !== null && (
					<FormSettingExplanation>
						{ userIsConnectionOwner
							? translate( "You are the owner of this site's connection to WordPress.com." )
							: translate(
									"{{strong}}%(connectionOwner)s{{/strong}} owns this site's connection to WordPress.com.",
									{
										args: { connectionOwner },
										components: {
											strong: <strong />,
										},
									}
							  ) }
					</FormSettingExplanation>
				) }
				{ userIsConnectionOwner && this.renderCurrentUserDropdown() }
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

		return isCurrentPlanOwner ? (
			this.renderPlanOwnerDropdown()
		) : (
			<FormSettingExplanation>
				{ translate( 'Somebody else is the plan purchaser for this site.' ) }
			</FormSettingExplanation>
		);
	}

	renderCardContent() {
		const { isPaidPlan, translate } = this.props;

		return (
			<>
				<FormFieldset className="manage-connection__formfieldset">
					<FormLabel>{ translate( 'Site owner' ) }</FormLabel>
					{ this.renderConnectionDetails() }
				</FormFieldset>

				{ isPaidPlan && (
					<Fragment>
						<FormFieldset className="manage-connection__formfieldset has-divider is-top-only">
							<FormLabel>{ translate( 'Plan purchaser' ) }</FormLabel>
							{ this.renderPlanDetails() }
						</FormFieldset>

						<OwnershipInformation />
					</Fragment>
				) }
			</>
		);
	}

	render() {
		const { canManageOptions, siteId, siteIsConnected, siteIsJetpack, translate } = this.props;

		if ( ! siteId ) {
			return this.renderPlaceholder();
		}

		if ( ! canManageOptions ) {
			return null;
		}

		return (
			<PanelSection>
				{ siteIsJetpack && <QueryJetpackConnection siteId={ siteId } /> }
				{ siteIsJetpack && <QueryJetpackUserConnection siteId={ siteId } /> }

				<PanelHeading>{ translate( 'Site ownership' ) }</PanelHeading>

				{ siteIsConnected === null ? this.renderPlaceholder() : this.renderCardContent() }
			</PanelSection>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const isPaidPlan = isCurrentPlanPaid( state, siteId );
		const isCurrentPlanOwner = isPaidPlan && isCurrentUserCurrentPlanOwner( state, siteId );

		return {
			canManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
			connectionOwner: getJetpackConnectionOwner( state, siteId ),
			currentUser: getCurrentUser( state ),
			isCurrentPlanOwner,
			isPaidPlan,
			siteId,
			siteIsConnected: isJetpackSiteConnected( state, siteId ),
			siteIsJetpack: isJetpackSite( state, siteId ),
			siteIsInDevMode: isJetpackSiteInDevelopmentMode( state, siteId ),
			userIsConnectionOwner: isJetpackUserConnectionOwner( state, siteId ),
		};
	},
	{ changeOwner, recordTracksEvent, transferPlanOwnership }
)( localize( SiteOwnership ) );
