/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import debugModule from 'debug';
import {
	identity,
	omit,
} from 'lodash';
import { localize } from 'i18n-calypso';
const debug = debugModule( 'calypso:my-sites:people:team-list' );

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PeopleListItem from 'my-sites/people/people-list-item';
import UsersActions from 'lib/users/actions';
import InfiniteList from 'components/infinite-list';
import deterministicStringify from 'lib/deterministic-stringify';
import NoResults from 'my-sites/no-results';
import PeopleListSectionHeader from 'my-sites/people/people-list-section-header';
import { recordGoogleEvent } from 'state/analytics/actions';

/**
 * Module Variables
 */

const renderLoadingPlaceholders = () => <PeopleListItem key="people-list-item-placeholder" />;

export class Team extends Component {
	static propTypes = {
		excludedUsers: PropTypes.array,
		translate: PropTypes.func,
		users: PropTypes.array,
	};

	static defaultProps = {
		excludedUsers: [],
		translate: identity,
		users: [],
	};

	isLastPage = () => {
		const {
			excludedUsers,
			users,
			totalUsers,
		} = this.props;

		return totalUsers <= ( users.length + excludedUsers.length );
	}

	renderPerson = ( user ) => {
		return (
			<PeopleListItem
				key={ user.ID }
				user={ user }
				type="user"
				site={ this.props.site } />
		);
	};

	fetchNextPage = () => {
		const {
			fetchOptions,
			recordFetchUsersForOffset,
			users,
		} = this.props;
		const offset = users.length;
		const newFetchOptions = { ...fetchOptions, offset };
		recordFetchUsersForOffset( offset );
		debug( 'fetching next batch of users' );
		UsersActions.fetchUsers( newFetchOptions );
	};

	getPersonRef = ( user ) => `user-${ user.ID }`;

	headerText = () => {
		const {
			search,
			site,
			totalUsers,
			translate,
			users,
		} = this.props;
		if ( search && totalUsers && site && users.length ) {
			return translate(
				'%(numberPeople)d Person Matching {{em}}"%(searchTerm)s"{{/em}}',
				'%(numberPeople)d People Matching {{em}}"%(searchTerm)s"{{/em}}',
				{
					count: users.length,
					args: {
						numberPeople: totalUsers,
						searchTerm: search,
					},
					components: {
						em: <em />
					},
				}
			);
		}
		return translate( 'Team' );
	};

	searchCompletedWithZeroResults = () => {
		const {
			fetchInitialized,
			fetchingUsers,
			search,
			users,
		} = this.props;

		return search && fetchInitialized  && ! fetchingUsers && ! users.length;
	};

	render() {
		const {
			fetchOptions,
			fetchingUsers,
			search,
			site,
			totalUsers,
			translate,
			users,
		} = this.props;

		if ( this.searchCompletedWithZeroResults() ) {
			return (
				<NoResults
					image="/calypso/images/people/mystery-person.svg"
					text={
						translate( 'No results found for {{em}}%(searchTerm)s{{/em}}',
							{
								args: { searchTerm: search },
								components: { em: <em /> }
							}
						)
					} />
			);
		}

		return (
			<div>
				<PeopleListSectionHeader
					label={ this.headerText() }
					site={ site }
					count={ ( fetchingUsers || search ) ? null : totalUsers } />
				<Card>
					<InfiniteList
						key={ deterministicStringify( omit( fetchOptions, [ 'number', 'offset' ] ) ) }
						items={ users }
						className="people-selector__infinite-list"
						fetchingNextPage={ fetchingUsers }
						lastPage={ this.isLastPage() }
						fetchNextPage={ this.fetchNextPage }
						getItemRef={ this.getPersonRef }
						renderLoadingPlaceholders={ renderLoadingPlaceholders }
						renderItem={ this.renderPerson }
						guessedItemHeight={ 126 }>
					</InfiniteList>
				</Card>
				{ this.isLastPage() && <div className="infinite-scroll-end" /> }
			</div>
		);
	}
}

const recordFetchUsersForOffset = ( offset ) => {
	return recordGoogleEvent( 'People', 'Fetched more users with infinite list', 'offset', offset );
};

const mapDispatchToProps = {
	recordFetchUsersForOffset
};

export default connect( null, mapDispatchToProps )( localize( Team ) );
