import debugModule from 'debug';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import ContractorSelect from 'calypso/my-sites/people/contractor-select';
import RoleSelect from 'calypso/my-sites/people/role-select';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSite } from 'calypso/state/sites/selectors';
import withExternalContributors from './with-external-contributors';
import withUpdateUser from './with-update-user';

import './style.scss';

/**
 * Module Variables
 */
const debug = debugModule( 'calypso:my-sites:people:edit-team-member-form' );

const fieldKeys = {
	firstName: 'first_name',
	lastName: 'last_name',
	name: 'name',
	roles: 'roles',
	isExternalContributor: 'isExternalContributor',
};

class EditUserForm extends Component {
	state = this.getStateObject( this.props );

	componentDidUpdate() {
		if ( ! this.hasUnsavedSettings() ) {
			this.props.markSaved();
		}
	}

	getStateObject( { user, isExternalContributor } ) {
		const { first_name, last_name, name, roles } = user;

		return {
			first_name,
			last_name,
			name,
			roles: roles?.[ 0 ],
			isExternalContributor,
		};
	}

	getChangedSettings() {
		const originalSettings = this.getStateObject( this.props );
		const allowedSettings = this.getAllowedSettingsToChange();
		const changedKeys = allowedSettings.filter( ( setting ) => {
			return (
				'undefined' !== typeof originalSettings[ setting ] &&
				'undefined' !== typeof this.state[ setting ] &&
				originalSettings[ setting ] !== this.state[ setting ]
			);
		} );
		const changedSettings = changedKeys.reduce( ( acc, key ) => {
			acc[ key ] = this.state[ key ];
			return acc;
		}, {} );

		return changedSettings;
	}

	getAllowedSettingsToChange() {
		const {
			currentUser,
			user,
			isJetpack,
			hasWPCOMAccountLinked,
			isVip,
			isWPForTeamsSite,
			siteOwner,
		} = this.props;
		const allowedSettings = new Set();

		if ( ! user.ID ) {
			return [];
		}

		/*
		 * If this is not a Jetpack site and the current user is not viewing their own profile,
		 * the user should not be able to edit the site owner's details.
		 */
		if ( ! isJetpack && user.ID === siteOwner && user.ID !== currentUser.ID ) {
			return [];
		}

		// On any site, admins should be able to change only other
		// user's role.
		if ( isJetpack ) {
			// Jetpack self hosted or Atomic.
			if ( ! user.linked_user_ID || user.linked_user_ID !== currentUser.ID ) {
				allowedSettings.add( fieldKeys.roles );
			}
		} else if ( user.ID !== currentUser.ID ) {
			// WP.com Simple sites.
			allowedSettings.add( fieldKeys.roles );
		}

		// On any site, allow editing 'first_name', 'last_name', 'name'
		// only for users without WP.com account.
		if ( ! hasWPCOMAccountLinked ) {
			allowedSettings.add( fieldKeys.firstName );
			allowedSettings.add( fieldKeys.lastName );
			allowedSettings.add( fieldKeys.name );
		}

		// Allow changing isExternalContributor for connected Users only
		// who aren't VIP on a site that's not WP for Teams
		// and belong to the External Roles array.
		if (
			hasWPCOMAccountLinked &&
			! isVip &&
			! isWPForTeamsSite &&
			this.isExternalRole( this.state.roles )
		) {
			allowedSettings.add( fieldKeys.isExternalContributor );
		}

		return Array.from( allowedSettings );
	}

	hasUnsavedSettings() {
		return Object.keys( this.getChangedSettings() ).length;
	}

	updateUser = ( event ) => {
		event.preventDefault();

		const { user, markSaved } = this.props;
		const changedSettings = this.getChangedSettings();
		debug( 'Changed settings: ' + JSON.stringify( changedSettings ) );

		markSaved();

		// Since we store 'roles' in state as a string, but user objects expect
		// roles to be an array, if we've updated the user's role, we need to
		// place the role in an array before updating the user.
		const changedAttributes = changedSettings.roles
			? Object.assign( changedSettings, { roles: [ changedSettings.roles ] } )
			: changedSettings;

		this.props.updateUser( user.ID, changedAttributes );

		if ( true === changedSettings.isExternalContributor ) {
			this.props.doAddExternalContributor( user?.linked_user_ID ?? user?.ID );
		} else if ( false === changedSettings.isExternalContributor ) {
			this.props.doRemoveExternalContributor( user?.linked_user_ID ?? user?.ID );
		}

		this.props.recordGoogleEvent( 'People', 'Clicked Save Changes Button on User Edit' );
	};

	recordFieldFocus = ( fieldId ) => () =>
		this.props.recordGoogleEvent( 'People', 'Focused on field on User Edit', 'Field', fieldId );

	handleChange = ( event ) => {
		const stateChange = { [ event.target.name ]: event.target.value };
		this.setState( stateChange );
	};

	handleExternalChange = ( event ) =>
		this.setState( { isExternalContributor: event.target.checked } );

	isExternalRole = ( role ) =>
		[ 'administrator', 'editor', 'author', 'contributor' ].includes( role );

	renderField = ( fieldId, isDisabled ) => {
		let returnField = null;
		switch ( fieldId ) {
			case fieldKeys.roles:
				returnField = (
					<RoleSelect
						key="role-select"
						id={ fieldKeys.roles }
						name={ fieldKeys.roles }
						siteId={ this.props.siteId }
						value={ this.state.roles }
						onChange={ this.handleChange }
						onFocus={ this.recordFieldFocus( fieldKeys.roles ) }
						disabled={ isDisabled }
					/>
				);
				break;
			case fieldKeys.isExternalContributor:
				returnField = (
					<ContractorSelect
						key="isExternalContributor"
						id={ fieldKeys.isExternalContributor }
						onChange={ this.handleExternalChange }
						checked={ this.state.isExternalContributor }
						disabled={ isDisabled || this.props.isExternalContributorsLoading }
					/>
				);
				break;
			case fieldKeys.firstName:
				returnField = (
					<FormFieldset key={ fieldKeys.firstName }>
						<FormLabel htmlFor={ fieldKeys.firstName }>
							{ this.props.translate( 'First Name', {
								context: 'Text that is displayed in a label of a form.',
							} ) }
						</FormLabel>
						<FormTextInput
							id={ fieldKeys.firstName }
							name={ fieldKeys.firstName }
							value={ this.state.first_name }
							onChange={ this.handleChange }
							onFocus={ this.recordFieldFocus( fieldKeys.firstName ) }
							disabled={ isDisabled }
						/>
					</FormFieldset>
				);
				break;
			case fieldKeys.lastName:
				returnField = (
					<FormFieldset key={ fieldKeys.lastName }>
						<FormLabel htmlFor={ fieldKeys.lastName }>
							{ this.props.translate( 'Last Name', {
								context: 'Text that is displayed in a label of a form.',
							} ) }
						</FormLabel>
						<FormTextInput
							id={ fieldKeys.lastName }
							name={ fieldKeys.lastName }
							value={ this.state.last_name }
							onChange={ this.handleChange }
							onFocus={ this.recordFieldFocus( fieldKeys.lastName ) }
							disabled={ isDisabled }
						/>
					</FormFieldset>
				);
				break;
			case fieldKeys.name:
				returnField = (
					<FormFieldset key={ fieldKeys.name }>
						<FormLabel htmlFor={ fieldKeys.name }>
							{ this.props.translate( 'Public Display Name', {
								context: 'Text that is displayed in a label of a form.',
							} ) }
						</FormLabel>
						<FormTextInput
							id={ fieldKeys.name }
							name={ fieldKeys.name }
							value={ this.state.name }
							onChange={ this.handleChange }
							onFocus={ this.recordFieldFocus( fieldKeys.name ) }
							disabled={ isDisabled }
						/>
					</FormFieldset>
				);
				break;
		}

		return returnField;
	};

	render() {
		if ( ! this.props.user.ID ) {
			return null;
		}

		const editableFields = this.getAllowedSettingsToChange();

		if ( ! editableFields.length ) {
			return null;
		}

		const { translate, hasWPCOMAccountLinked, disabled, markChanged, isUpdating } = this.props;

		return (
			<form
				className="edit-team-member-form__form" // eslint-disable-line
				disabled={ disabled }
				onSubmit={ this.updateUser }
				onChange={ markChanged }
			>
				{ editableFields.map( ( fieldId ) => this.renderField( fieldId, isUpdating ) ) }
				{ hasWPCOMAccountLinked && (
					<p className="edit-team-member-form__explanation">
						{ translate(
							'This user has a WordPress.com account, only they are allowed to update their personal information through their WordPress.com profile settings.'
						) }
					</p>
				) }
				<FormButtonsBar>
					<FormButton disabled={ ! this.hasUnsavedSettings() || isUpdating }>
						{ this.props.translate( 'Save changes', {
							context: 'Button label that prompts user to save form',
						} ) }
					</FormButton>
				</FormButtonsBar>
			</form>
		);
	}
}

export default localize(
	withExternalContributors(
		connect(
			( state, { siteId, user, externalContributors } ) => {
				const userId = user.linked_user_ID || user.ID;
				const site = getSite( state, siteId );

				return {
					siteOwner: site?.site_owner,
					currentUser: getCurrentUser( state ),
					isExternalContributor:
						Array.isArray( externalContributors ) &&
						userId &&
						externalContributors.includes( userId ),
					isVip: isVipSite( state, siteId ),
					isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
					hasWPCOMAccountLinked: false !== user?.linked_user_ID,
				};
			},
			{
				recordGoogleEvent,
			}
		)( withUpdateUser( EditUserForm ) )
	)
);
