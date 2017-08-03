/**
 * External dependencies
 */
import React, { Component } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import debugModule from 'debug';
import omit from 'lodash/omit';
import assign from 'lodash/assign';
import filter from 'lodash/filter';
import pick from 'lodash/pick';
import page from 'page';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import PeopleProfile from 'my-sites/people/people-profile';
import UsersStore from 'lib/users/store';
import UsersActions from 'lib/users/actions';
import userModule from 'lib/user';
import { protectForm } from 'lib/protect-form';
import DeleteUser from 'my-sites/people/delete-user';
import PeopleNotices from 'my-sites/people/people-notices';
import PeopleLog from 'lib/people/log-store';
import analytics from 'lib/analytics';
import RoleSelect from 'my-sites/people/role-select';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PeopleLogStore from 'lib/people/log-store';
import {
	isJetpackSiteMultiSite,
	isJetpackSite,
} from 'state/sites/selectors';

/**
 * Module Variables
 */
const debug = debugModule( 'calypso:my-sites:people:edit-team-member-form' );
const user = userModule();

const EditUserForm = React.createClass( {
	displayName: 'EditUserForm',

	mixins: [ PureRenderMixin ],

	getInitialState() {
		return this.getStateObject( this.props );
	},

	componentWillReceiveProps( nextProps ) {
		this.replaceState( this.getStateObject( nextProps ) );
	},

	getRole( roles ) {
		return roles && roles[ 0 ] ? roles[ 0 ] : null;
	},

	getStateObject( props ) {
		props = 'undefined' !== typeof props ? props : this.props;
		const role = this.getRole( props.roles );
		return assign(
			omit( props, 'site' ),
			{ roles: role }
		);
	},

	getChangedSettings() {
		const originalUser = this.getStateObject( this.props.user );
		const changedKeys = filter( this.getAllowedSettingsToChange(), ( setting ) => {
			return 'undefined' !== typeof originalUser[ setting ] &&
				'undefined' !== typeof this.state[ setting ] &&
				originalUser[ setting ] !== this.state[ setting ];
		} );

		return pick( this.state, changedKeys );
	},

	getAllowedSettingsToChange() {
		const currentUser = user.get();
		let allowedSettings = []; // eslint-disable-line

		if ( ! this.state.ID ) {
			return allowedSettings;
		}

		// On WP.com sites, a user should only be able to update role.
		// A user should not be able to update own role.
		if ( this.props.isJetpack ) {
			if ( ! this.state.linked_user_ID || this.state.linked_user_ID !== currentUser.ID ) {
				allowedSettings.push( 'roles' );
			}
			allowedSettings.push( 'first_name' );
			allowedSettings.push( 'last_name' );
			allowedSettings.push( 'name' );
		} else if ( this.state.ID !== currentUser.ID ) {
			allowedSettings.push( 'roles' );
		}

		return allowedSettings;
	},

	hasUnsavedSettings() {
		return Object.keys( this.getChangedSettings() ).length;
	},

	updateUser( event ) {
		event.preventDefault();

		const changedSettings = this.getChangedSettings();
		debug( 'Changed settings: ' + JSON.stringify( changedSettings ) );

		this.props.markSaved();

		// Since we store 'roles' in state as a string, but user objects expect
		// roles to be an array, if we've updated the user's role, we need to
		// place the role in an array before updating the user.
		UsersActions.updateUser(
			this.props.siteId,
			this.state.ID,
			changedSettings.roles ? Object.assign( changedSettings, { roles: [ changedSettings.roles ] } ) : changedSettings
		);
		analytics.ga.recordEvent( 'People', 'Clicked Save Changes Button on User Edit' );
	},

	recordFieldFocus( fieldId ) {
		analytics.ga.recordEvent( 'People', 'Focused on field on User Edit', 'Field', fieldId );
	},

	handleChange( event ) {
		this.setState( {
			[ event.target.name ]: event.target.value
		} );
	},

	renderField( fieldId ) {
		let returnField = null;
		switch ( fieldId ) {
			case 'roles':
				returnField = (
					<RoleSelect
						id="roles"
						name="roles"
						key="roles"
						siteId={ this.props.siteId }
						value={ this.state.roles }
						onChange={ this.handleChange }
						onFocus={ this.recordFieldFocus( 'roles' ) }
					/>
				);
				break;
			case 'first_name':
				returnField = (
					<FormFieldset key="first_name">
						<FormLabel htmlFor="first_name">
							{ this.translate( 'First Name', { context: 'Text that is displayed in a label of a form.' } ) }
						</FormLabel>
						<FormTextInput
							id="first_name"
							name="first_name"
							defaultValue={ this.state.first_name }
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
							{ this.translate( 'Last Name', { context: 'Text that is displayed in a label of a form.' } ) }
						</FormLabel>
						<FormTextInput
							id="last_name"
							name="last_name"
							defaultValue={ this.state.last_name }
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
							{ this.translate( 'Public Display Name', { context: 'Text that is displayed in a label of a form.' } ) }
						</FormLabel>
						<FormTextInput
							id="name"
							name="name"
							defaultValue={ this.state.name }
							onChange={ this.handleChange }
							onFocus={ this.recordFieldFocus( 'name' ) }
						/>
					</FormFieldset>
				);
				break;
		}

		return returnField;
	},

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
						{ this.translate( 'Save changes', { context: 'Button label that prompts user to save form' } ) }
					</FormButton>
				</FormButtonsBar>
			</form>
		);
	}
} );

export class EditTeamMemberForm extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			user: UsersStore.getUserByLogin( props.siteId, props.userLogin ),
			removingUser: false,
		};
	}

	componentDidMount() {
		UsersStore.on( 'change', this.refreshUser );
		PeopleLog.on( 'change', this.checkRemoveUser );
		PeopleLog.on( 'change', this.redirectIfError );
		this.requestUser();
	}

	componentWillUnmount() {
		UsersStore.removeListener( 'change', this.refreshUser );
		PeopleLog.removeListener( 'change', this.checkRemoveUser );
		PeopleLog.removeListener( 'change', this.redirectIfError );
	}

	componentDidUpdate( lastProps ) {
		if ( lastProps.siteId !== this.props.siteId || lastProps.userLogin !== this.props.userLogin ) {
			this.requestUser();
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId || nextProps.userLogin !== this.props.userLogin ) {
			this.refreshUser( nextProps );
		}
	}

	requestUser = () => {
		if ( this.props.siteId ) {
			UsersActions.fetchUser( { siteId: this.props.siteId }, this.props.userLogin );
		}
	};

	refreshUser = ( props = this.props ) => {
		const peopleUser = UsersStore.getUserByLogin( props.siteId, props.userLogin );

		this.setState( {
			user: peopleUser
		} );
	};

	redirectIfError = () => {
		if ( this.props.siteId ) {
			const fetchUserError = PeopleLogStore.getErrors(
				log => this.props.siteId === log.siteId && 'RECEIVE_USER_FAILED' === log.action && this.props.userLogin === log.user
			);
			if ( fetchUserError.length ) {
				page.redirect( `/people/team/${ this.props.siteSlug }` );
			}
		}
	};

	checkRemoveUser = () => {
		if ( ! this.props.siteId ) {
			return;
		}

		const removeUserSuccessful = PeopleLog.getCompleted( ( log ) => {
			return 'RECEIVE_DELETE_SITE_USER_SUCCESS' === log.action &&
				this.props.siteId === log.siteId &&
				this.props.userLogin === log.user.login;
		} );

		if ( removeUserSuccessful.length ) {
			this.props.markSaved();
			const redirect = this.props.siteSlug ? '/people/team/' + this.props.siteSlug : '/people/team';
			page.redirect( redirect );
		}

		const removeUserInProgress = PeopleLog.getInProgress( function( log ) {
			return 'DELETE_SITE_USER' === log.action &&
				this.props.siteId === log.siteId &&
				this.props.userLogin === log.user.login;
		}.bind( this ) );

		if ( !! removeUserInProgress.length !== this.state.removingUser ) {
			this.setState( {
				removingUser: ! this.state.removingUser
			} );
		}
	};

	goBack = () => {
		analytics.ga.recordEvent( 'People', 'Clicked Back Button on User Edit' );
		if ( this.props.siteSlug ) {
			const teamBack = '/people/team/' + this.props.siteSlug,
				readersBack = '/people/readers/' + this.props.siteSlug;
			if ( this.props.prevPath === teamBack ) {
				page.back( teamBack );
			} else if ( this.props.prevPath === readersBack ) {
				page.back( readersBack );
			} else {
				page( teamBack );
			}
			return;
		}
		page( '/people/team' );
	};

	renderNotices() {
		if ( ! this.state.user ) {
			return;
		}
		return (
			<PeopleNotices user={ this.state.user } />
		);
	}

	render() {
		return (
			<Main className="edit-team-member-form">
				<PageViewTracker path="people/edit/:user_login/:site" title="View Team Member" />
				<HeaderCake onClick={ this.goBack } isCompact />
				{ this.renderNotices() }
				<Card className="edit-team-member-form__user-profile">
					<PeopleProfile user={ this.state.user } />
					<EditUserForm
						{ ...this.state.user }
						disabled={ this.state.removingUser }
						siteId={ this.props.siteId }
						isJetpack={ this.props.isJetpack }
						markChanged={ this.props.markChanged }
						markSaved={ this.props.markSaved }
					/>
				</Card>
				{
					this.state.user &&
					<DeleteUser
						{ ...pick( this.props, [ 'siteId', 'isJetpack', 'isMultisite' ] ) }
						currentUser={ user.get() }
						user={ this.state.user }
					/>
				}
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			isJetpack: isJetpackSite( state, siteId ),
			isMultisite: isJetpackSiteMultiSite( state, siteId ),
		};
	}
)( protectForm( EditTeamMemberForm ) );
