/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
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
import analytics from 'lib/analytics';
import PeopleListSectionHeader from 'my-sites/people/people-list-section-header';

/**
 * Module Variables
 */
class Team extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	constructor() {
		super( ...arguments );
		this.state = {
			bulkEditing: false
		};
	}

	render() {
		const { props, state } = this;
		const { translate } = props;
		const key = deterministicStringify( omit( props.fetchOptions, [ 'number', 'offset' ] ) );
		const	listClass = classNames( {
			'bulk-editing': state.bulkEditing,
		} );

		let headerText = translate( 'Team', { context: 'A navigation label.' } );
		let people;

		const isLastPage = () => props.totalUsers <= props.users.length + props.excludedUsers.length;
		const renderPerson = ( user ) => {
			return (
				<PeopleListItem
					key={ user.ID }
					user={ user }
					type="user"
					site={ props.site }
					isSelectable={ state.bulkEditing } />
			);
		};

		const fetchNextPage = () => {
			const offset = props.users.length;
			const fetchOptions = Object.assign( {}, props.fetchOptions, { offset: offset } );
			analytics.ga.recordEvent( 'People', 'Fetched more users with infinite list', 'offset', offset );
			debug( 'fetching next batch of users' );
			UsersActions.fetchUsers( fetchOptions );
		};

		const getPersonRef = ( user ) => `user-${ user.ID }`;

		const renderLoadingPeople = () => <PeopleListItem key="people-list-item-placeholder" />;

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

		if ( props.site && props.users.length ) {
			if ( props.search && props.totalUsers ) {
				headerText = translate(
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

			people = (
				<InfiniteList
					key={ key }
					items={ props.users }
					className="people-selector__infinite-list"
					ref="infiniteList"
					fetchingNextPage={ props.fetchingUsers }
					lastPage={ isLastPage() }
					fetchNextPage={ fetchNextPage }
					getItemRef={ getPersonRef }
					renderLoadingPlaceholders={ renderLoadingPeople }
					renderItem={ renderPerson }
					guessedItemHeight={ 126 }>
				</InfiniteList>
			);
		} else {
			people = renderLoadingPeople();
		}

		return (
			<div>
				<PeopleListSectionHeader
					label={ headerText }
					site={ props.site }
					count={ props.fetchingUsers || props.fetchOptions.search ? null : props.totalUsers } />
				<Card className={ listClass }>
					{ people }
				</Card>
				{ isLastPage() && <div className="infinite-scroll-end" /> }
			</div>
		);
	}
}

export default localize( Team );
