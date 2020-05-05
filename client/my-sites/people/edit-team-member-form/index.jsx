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
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import { Card } from '@automattic/components';
import PeopleProfile from 'my-sites/people/people-profile';
import UsersStore from 'lib/users/store';
import { fetchUser } from 'lib/users/actions';
import { protectForm } from 'lib/protect-form';
import DeleteUser from 'my-sites/people/delete-user';
import PeopleNotices from 'my-sites/people/people-notices';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PeopleLogStore from 'lib/people/log-store';
import { isJetpackSiteMultiSite, isJetpackSite } from 'state/sites/selectors';
import EditUserForm from './edit-user-form';
import { recordGoogleEvent } from 'state/analytics/actions';
import getPreviousRoute from 'state/selectors/get-previous-route';

/**
 * Style dependencies
 */
import './style.scss';

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
		PeopleLogStore.on( 'change', this.checkRemoveUser );
		PeopleLogStore.on( 'change', this.redirectIfError );
		this.requestUser();
	}

	componentWillUnmount() {
		UsersStore.removeListener( 'change', this.refreshUser );
		PeopleLogStore.removeListener( 'change', this.checkRemoveUser );
		PeopleLogStore.removeListener( 'change', this.redirectIfError );
	}

	componentDidUpdate( lastProps ) {
		if ( lastProps.siteId !== this.props.siteId || lastProps.userLogin !== this.props.userLogin ) {
			this.requestUser();
		}
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId || nextProps.userLogin !== this.props.userLogin ) {
			this.refreshUser( nextProps );
		}
	}

	requestUser = () => {
		if ( this.props.siteId ) {
			fetchUser( { siteId: this.props.siteId }, this.props.userLogin );
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
				( log ) =>
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

		const removeUserSuccessful = PeopleLogStore.getCompleted( ( log ) => {
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

		const removeUserInProgress = PeopleLogStore.getInProgress(
			function ( log ) {
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
		this.props.recordGoogleEvent( 'People', 'Clicked Back Button on User Edit' );
		if ( this.props.previousRoute ) {
			page.back( this.props.previousRoute );
			return;
		}
		if ( this.props.siteSlug ) {
			page( '/people/team/' + this.props.siteSlug );
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
				<PageViewTracker path="people/edit/:site/:user" title="People > View Team Member" />
				<HeaderCake onClick={ this.goBack } isCompact />
				{ this.renderNotices() }
				<Card className="edit-team-member-form__user-profile">
					<PeopleProfile siteId={ this.props.siteId } user={ this.state.user } />
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
						user={ this.state.user }
					/>
				) }
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
			previousRoute: getPreviousRoute( state ),
		};
	},
	{ recordGoogleEvent }
)( protectForm( EditTeamMemberForm ) );
