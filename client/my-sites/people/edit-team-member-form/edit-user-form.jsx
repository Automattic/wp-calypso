import { FormLabel } from '@automattic/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import debugModule from 'debug';
import { localize } from 'i18n-calypso';
import { defer, omit } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import useAddExternalContributorMutation from 'calypso/data/external-contributors/use-add-external-contributor-mutation';
import useExternalContributorsQuery from 'calypso/data/external-contributors/use-external-contributors';
import useRemoveExternalContributorMutation from 'calypso/data/external-contributors/use-remove-external-contributor-mutation';
import ContractorSelect from 'calypso/my-sites/people/contractor-select';
import RoleSelect from 'calypso/my-sites/people/role-select';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSite } from 'calypso/state/sites/selectors';
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

	static getDerivedStateFromProps( { isExternalContributor }, state ) {
		if ( isExternalContributor !== undefined && state.isExternalContributor === undefined ) {
			return { isExternalContributor };
		}
		return null;
	}

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
			isAtomic,
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
		 * On Atomic and non-Jetpack sites, if the current user is not viewing their own profile,
		 * the user should not be able to edit the site owner's details.
		 */
		const userId = user.linked_user_ID || user.ID;
		if ( ( ! isJetpack || isAtomic ) && userId === siteOwner && userId !== currentUser.ID ) {
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
		event && event.preventDefault();

		const { siteId, user, markSaved } = this.props;
		const changedSettings = this.getChangedSettings();
		debug( 'Changed settings: ' + JSON.stringify( changedSettings ) );

		markSaved();

		// Since we store 'roles' in state as a string, but user objects expect
		// roles to be an array, if we've updated the user's role, we need to
		// place the role in an array before updating the user.
		const changedAttributes = changedSettings.roles
			? Object.assign( changedSettings, { roles: [ changedSettings.roles ] } )
			: changedSettings;
		// User object doesn't support isExternalContributor field
		const changedUserAttributes = omit( changedAttributes, 'isExternalContributor' );

		if ( Object.keys( changedUserAttributes ).length ) {
			this.props.updateUser( user.ID, changedUserAttributes );
		}

		if ( true === changedSettings.isExternalContributor ) {
			this.props.addExternalContributor(
				siteId,
				user?.linked_user_ID ?? user?.ID // On simple sites linked_user_ID is undefined for connected users.
			);
		} else if ( false === changedSettings.isExternalContributor ) {
			this.props.removeExternalContributor(
				siteId,
				user?.linked_user_ID ?? user?.ID // On simple sites linked_user_ID is undefined for connected users.
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

	renderField = ( fieldId, isDisabled ) => {
		let returnField = null;
		switch ( fieldId ) {
			case fieldKeys.roles:
				returnField = (
					<RoleSelect
						key="role-select"
						formControlType={ this.props.roleSelectControlType }
						explanation
						id={ fieldKeys.roles }
						name={ fieldKeys.roles }
						siteId={ this.props.siteId }
						value={ this.state.roles }
						onChange={ this.handleChange }
						onFocus={ this.recordFieldFocus( fieldKeys.roles ) }
						disabled={ isDisabled }
						includeFollower={ this.state.roles === 'follower' }
						includeSubscriber={ this.state.roles === 'subscriber' }
					/>
				);
				break;
			case fieldKeys.isExternalContributor:
				returnField = (
					<ContractorSelect
						key="isExternalContributor"
						id={ fieldKeys.isExternalContributor }
						onChange={ this.handleExternalChange }
						checked={ !! this.state.isExternalContributor }
						disabled={ isDisabled || this.state.isExternalContributor === undefined }
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

	onFormChange() {
		this.props.markChanged();
		if ( this.props.autoSave ) {
			// defer to pick up the most recent form values
			defer( () => this.updateUser() );
		}
	}

	render() {
		if ( ! this.props.user.ID ) {
			return null;
		}

		const editableFields = this.getAllowedSettingsToChange();

		if ( ! editableFields.length ) {
			return null;
		}

		const { autoSave, currentUser, user, translate, hasWPCOMAccountLinked, disabled, isUpdating } =
			this.props;

		return (
			<form
				className="edit-team-member-form__form" // eslint-disable-line
				disabled={ disabled }
				onSubmit={ this.updateUser }
				onChange={ () => this.onFormChange() }
			>
				{ editableFields.map( ( fieldId ) => this.renderField( fieldId, isUpdating ) ) }
				{ hasWPCOMAccountLinked && user.ID !== currentUser.ID && (
					<p className="edit-team-member-form__explanation">
						{ translate(
							'This user has a WordPress.com account. Only they are allowed to update their personal information through their WordPress.com profile settings.'
						) }
					</p>
				) }
				{ ! autoSave && (
					<FormButtonsBar>
						<FormButton disabled={ ! this.hasUnsavedSettings() || isUpdating }>
							{ this.props.translate( 'Save changes', {
								context: 'Button label that prompts user to save form',
							} ) }
						</FormButton>
					</FormButtonsBar>
				) }
			</form>
		);
	}
}

const withExternalContributors = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { siteId, user } = props;
		const {
			data: externalContributors = [],
			isLoading,
			isFetching,
		} = useExternalContributorsQuery( siteId, { staleTime: 0 } );
		const isUpdatingContributorStatus = isLoading || isFetching;
		const { addExternalContributor } = useAddExternalContributorMutation();
		const { removeExternalContributor } = useRemoveExternalContributorMutation();
		const userId = user.linked_user_ID || user.ID;
		const isExternalContributor =
			userId && ! isUpdatingContributorStatus
				? externalContributors?.includes( userId )
				: undefined;

		return (
			<Wrapped
				{ ...props }
				isExternalContributor={ isExternalContributor }
				addExternalContributor={ addExternalContributor }
				removeExternalContributor={ removeExternalContributor }
			/>
		);
	},
	'WithExternalContributors'
);

export default localize(
	connect(
		( state, { siteId, user } ) => {
			const site = getSite( state, siteId );

			return {
				siteOwner: site?.site_owner,
				currentUser: getCurrentUser( state ),
				isAtomic: isSiteAutomatedTransfer( state, siteId ),
				isVip: isVipSite( state, siteId ),
				isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
				hasWPCOMAccountLinked: false !== user?.linked_user_ID,
			};
		},
		{
			recordGoogleEvent,
		}
	)( withUpdateUser( withExternalContributors( EditUserForm ) ) )
);
