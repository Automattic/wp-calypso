/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import debugModule from 'debug';
import omit from 'lodash/omit';
import identity from 'lodash/identity';
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
export class Team extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	isLastPage = () => this.props.totalUsers <= this.props.users.length + this.props.excludedUsers.length;

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
		const offset = this.props.users.length;
		const fetchOptions = { ...this.props.fetchOptions, offset };
		this.props.recordFetchUsersForOffset( offset );
		debug( 'fetching next batch of users' );
		UsersActions.fetchUsers( fetchOptions );
	};

	getPersonRef = ( user ) => `user-${ user.ID }`;

	headerText = () => {
		const { props } = this;
		const { translate } = props;
		if ( props.search && props.totalUsers && props.site && props.users.length ) {
			return translate(
				'%(numberPeople)d Person Matching {{em}}"%(searchTerm)s"{{/em}}',
				'%(numberPeople)d People Matching {{em}}"%(searchTerm)s"{{/em}}',
				{
					count: props.users.length,
					args: {
						numberPeople: props.totalUsers,
						searchTerm: props.search
					},
					components: {
						em: <em />
					}
				}
			);
		}
		return translate( 'Team', { context: 'A navigation label.' } );
	};

	cardContent = () => {
		const { props } = this;
		const { site, users, fetchOptions, fetchingUsers } = props;
		const key = deterministicStringify( omit( fetchOptions, [ 'number', 'offset' ] ) );
		const renderLoadingPeople = () => <PeopleListItem key="people-list-item-placeholder" />;

		if ( site && users.length ) {
			return (
				<InfiniteList
					key={ key }
					items={ users }
					className="people-selector__infinite-list"
					ref="infiniteList"
					fetchingNextPage={ fetchingUsers }
					lastPage={ this.isLastPage() }
					fetchNextPage={ this.fetchNextPage }
					getItemRef={ this.getPersonRef }
					renderLoadingPlaceholders={ renderLoadingPeople }
					renderItem={ this.renderPerson }
					guessedItemHeight={ 126 }>
				</InfiniteList>
			);
		}
		return renderLoadingPeople();
	};

	render() {
		const { props } = this;
		const { translate } = props;

		if ( props.fetchInitialized && ! props.users.length && props.fetchOptions.search && ! props.fetchingUsers ) {
			return (
				<NoResults
					image="/calypso/images/people/mystery-person.svg"
					text={
						translate( 'No results found for {{em}}%(searchTerm)s{{/em}}',
							{
								args: { searchTerm: props.search },
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
					site={ props.site }
					count={ props.fetchingUsers || props.fetchOptions.search ? null : props.totalUsers } />
				<Card>
					{ this.cardContent() }
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
