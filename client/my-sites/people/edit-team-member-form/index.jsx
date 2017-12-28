/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { pick } from 'lodash';
import page from 'page';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'client/components/main';
import HeaderCake from 'client/components/header-cake';
import Card from 'client/components/card';
import PeopleProfile from 'client/my-sites/people/people-profile';
import UsersStore from 'client/lib/users/store';
import UsersActions from 'client/lib/users/actions';
import userModule from 'client/lib/user';
import { protectForm } from 'client/lib/protect-form';
import DeleteUser from 'client/my-sites/people/delete-user';
import PeopleNotices from 'client/my-sites/people/people-notices';
import PeopleLog from 'client/lib/people/log-store';
import analytics from 'client/lib/analytics';
import { getSelectedSiteId, getSelectedSiteSlug } from 'client/state/ui/selectors';
import PageViewTracker from 'client/lib/analytics/page-view-tracker';
import PeopleLogStore from 'client/lib/people/log-store';
import { isJetpackSiteMultiSite, isJetpackSite } from 'client/state/sites/selectors';
import EditUserForm from './edit-user-form';

/**
 * Module Variables
 */
const user = userModule();

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
			user: peopleUser,
		} );
	};

	redirectIfError = () => {
		if ( this.props.siteId ) {
			const fetchUserError = PeopleLogStore.getErrors(
				log =>
					this.props.siteId === log.siteId &&
					'RECEIVE_USER_FAILED' === log.action &&
					this.props.userLogin === log.user
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

		const removeUserSuccessful = PeopleLog.getCompleted( log => {
			return (
				'RECEIVE_DELETE_SITE_USER_SUCCESS' === log.action &&
				this.props.siteId === log.siteId &&
				this.props.userLogin === log.user.login
			);
		} );

		if ( removeUserSuccessful.length ) {
			this.props.markSaved();
			const redirect = this.props.siteSlug ? '/people/team/' + this.props.siteSlug : '/people/team';
			page.redirect( redirect );
		}

		const removeUserInProgress = PeopleLog.getInProgress(
			function( log ) {
				return (
					'DELETE_SITE_USER' === log.action &&
					this.props.siteId === log.siteId &&
					this.props.userLogin === log.user.login
				);
			}.bind( this )
		);

		if ( !! removeUserInProgress.length !== this.state.removingUser ) {
			this.setState( {
				removingUser: ! this.state.removingUser,
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
		return <PeopleNotices user={ this.state.user } />;
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
				{ this.state.user && (
					<DeleteUser
						{ ...pick( this.props, [ 'siteId', 'isJetpack', 'isMultisite' ] ) }
						currentUser={ user.get() }
						user={ this.state.user }
					/>
				) }
			</Main>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		isJetpack: isJetpackSite( state, siteId ),
		isMultisite: isJetpackSiteMultiSite( state, siteId ),
	};
} )( protectForm( EditTeamMemberForm ) );
