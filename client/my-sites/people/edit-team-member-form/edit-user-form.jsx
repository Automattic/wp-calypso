/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import debugModule from 'debug';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ContractorSelect from 'calypso/my-sites/people/contractor-select';
import FormLabel from 'calypso/components/forms/form-label';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { updateUser } from 'calypso/lib/users/actions';
import RoleSelect from 'calypso/my-sites/people/role-select';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import {
	requestExternalContributors,
	requestExternalContributorsAddition,
	requestExternalContributorsRemoval,
} from 'calypso/state/data-getters';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Module Variables
 */
const debug = debugModule( 'calypso:my-sites:people:edit-team-member-form' );

class EditUserForm extends Component {
	state = this.getStateObject( this.props );

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.setState( this.getStateObject( nextProps ) );
	}

	componentDidUpdate() {
		if ( ! this.hasUnsavedSettings() ) {
			this.props.markSaved();
		}
	}

	getRole( roles ) {
		return roles && roles[ 0 ] ? roles[ 0 ] : null;
	}

	getStateObject( props ) {
		return {
			...props.user,
			roles: this.getRole( props.user?.roles ),
			isExternalContributor: props.isExternalContributor,
		};
	}

	getChangedSettings() {
		const originalUser = this.getStateObject( this.props );
		const allowedSettings = this.getAllowedSettingsToChange();
		const changedKeys = allowedSettings.filter( ( setting ) => {
			return (
				'undefined' !== typeof originalUser[ setting ] &&
				'undefined' !== typeof this.state[ setting ] &&
				originalUser[ setting ] !== this.state[ setting ]
			);
		} );
		const changedSettings = changedKeys.reduce( ( acc, key ) => {
			acc[ key ] = this.state[ key ];
			return acc;
		}, {} );

		return changedSettings;
	}

	getAllowedSettingsToChange() {
		const currentUser = this.props.currentUser;
		const allowedSettings = [];

		if ( ! this.state.ID ) {
			return allowedSettings;
		}

		// On WP.com sites, a user should only be able to update role.
		// A user should not be able to update own role.
		if ( this.props.isJetpack ) {
			if ( ! this.state.linked_user_ID || this.state.linked_user_ID !== currentUser.ID ) {
				allowedSettings.push( 'roles', 'isExternalContributor' );
			}
			allowedSettings.push( 'first_name', 'last_name', 'name' );
		} else if ( this.state.ID !== currentUser.ID ) {
			allowedSettings.push( 'roles', 'isExternalContributor' );
		}

		return allowedSettings;
	}

	hasUnsavedSettings() {
		return Object.keys( this.getChangedSettings() ).length;
	}

	updateUser = ( event ) => {
		event.preventDefault();

		const changedSettings = this.getChangedSettings();
		debug( 'Changed settings: ' + JSON.stringify( changedSettings ) );

		this.props.markSaved();

		// Since we store 'roles' in state as a string, but user objects expect
		// roles to be an array, if we've updated the user's role, we need to
		// place the role in an array before updating the user.
		updateUser(
			this.props.siteId,
			this.state.ID,
			changedSettings.roles
				? Object.assign( changedSettings, { roles: [ changedSettings.roles ] } )
				: changedSettings
		);

		if ( true === changedSettings.isExternalContributor ) {
			requestExternalContributorsAddition(
				this.props.siteId,
				undefined !== this.state.linked_user_ID ? this.state.linked_user_ID : this.state.ID
			);
		} else if ( false === changedSettings.isExternalContributor ) {
			requestExternalContributorsRemoval(
				this.props.siteId,
				undefined !== this.state.linked_user_ID ? this.state.linked_user_ID : this.state.ID
			);
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

	renderField( fieldId ) {
		let returnField = null;
		switch ( fieldId ) {
			case 'roles':
				returnField = (
					<Fragment key="roles">
						<RoleSelect
							id="roles"
							name="roles"
							siteId={ this.props.siteId }
							value={ this.state.roles }
							onChange={ this.handleChange }
							onFocus={ this.recordFieldFocus( 'roles' ) }
						/>
						{ ! this.props.isVip &&
							! this.props.isWPForTeamsSite &&
							this.isExternalRole( this.state.roles ) && (
								<ContractorSelect
									onChange={ this.handleExternalChange }
									checked={ this.state.isExternalContributor }
								/>
							) }
					</Fragment>
				);
				break;
			case 'first_name':
				returnField = (
					<FormFieldset key="first_name">
						<FormLabel htmlFor="first_name">
							{ this.props.translate( 'First Name', {
								context: 'Text that is displayed in a label of a form.',
							} ) }
						</FormLabel>
						<FormTextInput
							id="first_name"
							name="first_name"
							value={ this.state.first_name }
							onChange={ this.handleChange }
							onFocus={ this.recordFieldFocus( 'first_name' ) }
						/>
					</FormFieldset>
				);
				break;
			case 'last_name':
				returnField = (
					<FormFieldset key="last_name">
						<FormLabel htmlFor="last_name">
							{ this.props.translate( 'Last Name', {
								context: 'Text that is displayed in a label of a form.',
							} ) }
						</FormLabel>
						<FormTextInput
							id="last_name"
							name="last_name"
							value={ this.state.last_name }
							onChange={ this.handleChange }
							onFocus={ this.recordFieldFocus( 'last_name' ) }
						/>
					</FormFieldset>
				);
				break;
			case 'name':
				returnField = (
					<FormFieldset key="name">
						<FormLabel htmlFor="name">
							{ this.props.translate( 'Public Display Name', {
								context: 'Text that is displayed in a label of a form.',
							} ) }
						</FormLabel>
						<FormTextInput
							id="name"
							name="name"
							value={ this.state.name }
							onChange={ this.handleChange }
							onFocus={ this.recordFieldFocus( 'name' ) }
						/>
					</FormFieldset>
				);
				break;
		}

		return returnField;
	}

	render() {
		let editableFields;
		if ( ! this.state.ID ) {
			return null;
		}

		editableFields = this.getAllowedSettingsToChange();

		if ( ! editableFields.length ) {
			return null;
		}

		editableFields = editableFields.map( ( fieldId ) => {
			return this.renderField( fieldId );
		} );

		return (
			<form
				className="edit-team-member-form__form" // eslint-disable-line
				disabled={ this.props.disabled }
				onSubmit={ this.updateUser }
				onChange={ this.props.markChanged }
			>
				{ editableFields }
				<FormButtonsBar>
					<FormButton disabled={ ! this.hasUnsavedSettings() }>
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
	connect(
		( state, { siteId, user } ) => {
			const externalContributors = ( siteId && requestExternalContributors( siteId ).data ) || [];
			return {
				currentUser: getCurrentUser( state ),
				isExternalContributor: externalContributors.includes( user?.linked_user_ID ?? user?.ID ),
				isVip: isVipSite( state, siteId ),
				isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
			};
		},
		{
			recordGoogleEvent,
		}
	)( EditUserForm )
);
