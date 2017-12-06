/** @format */
/**
 * External dependencies
 */
import deterministicStringify from 'json-stable-stringify';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';
import React from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PeopleListItem from 'my-sites/people/people-list-item';
import UsersActions from 'lib/users/actions';
import InfiniteList from 'components/infinite-list';
import NoResults from 'my-sites/no-results';
import analytics from 'lib/analytics';
import PeopleListSectionHeader from 'my-sites/people/people-list-section-header';
import ListEnd from 'components/list-end';

const debug = debugFactory( 'calypso:my-sites:people:team-list' );

class Team extends React.Component {
	static displayName = 'Team';

	state = {
		bulkEditing: false,
	};

	isLastPage = () => {
		return this.props.totalUsers <= this.props.users.length + this.props.excludedUsers.length;
	};

	render() {
		var key = deterministicStringify( omit( this.props.fetchOptions, [ 'number', 'offset' ] ) ),
			headerText = this.props.translate( 'Team', { context: 'A navigation label.' } ),
			listClass = this.state.bulkEditing ? 'bulk-editing' : null,
			people;

		if (
			this.props.fetchInitialized &&
			! this.props.users.length &&
			this.props.fetchOptions.search &&
			! this.props.fetchingUsers
		) {
			return (
				<NoResults
					image="/calypso/images/people/mystery-person.svg"
					text={ this.props.translate( 'No results found for {{em}}%(searchTerm)s{{/em}}', {
						args: { searchTerm: this.props.search },
						components: { em: <em /> },
					} ) }
				/>
			);
		}

		if ( this.props.site && this.props.users.length ) {
			if ( this.props.search && this.props.totalUsers ) {
				headerText = this.props.translate(
					'%(numberPeople)d Person Matching {{em}}"%(searchTerm)s"{{/em}}',
					'%(numberPeople)d People Matching {{em}}"%(searchTerm)s"{{/em}}',
					{
						count: this.props.users.length,
						args: {
							numberPeople: this.props.totalUsers,
							searchTerm: this.props.search,
						},
						components: {
							em: <em />,
						},
					}
				);
			}

			people = (
				<InfiniteList
					key={ key }
					items={ this.props.users }
					className="people-selector__infinite-list"
					ref="infiniteList"
					fetchingNextPage={ this.props.fetchingUsers }
					lastPage={ this.isLastPage() }
					fetchNextPage={ this._fetchNextPage }
					getItemRef={ this._getPersonRef }
					renderLoadingPlaceholders={ this._renderLoadingPeople }
					renderItem={ this._renderPerson }
					guessedItemHeight={ 126 }
				/>
			);
		} else {
			people = this._renderLoadingPeople();
		}

		return (
			<div>
				<PeopleListSectionHeader
					label={ headerText }
					site={ this.props.site }
					count={
						this.props.fetchingUsers || this.props.fetchOptions.search
							? null
							: this.props.totalUsers
					}
				/>
				<Card className={ listClass }>{ people }</Card>
				{ this.isLastPage() && <ListEnd /> }
			</div>
		);
	}

	_renderPerson = user => {
		return (
			<PeopleListItem
				key={ user.ID }
				user={ user }
				type="user"
				site={ this.props.site }
				isSelectable={ this.state.bulkEditing }
			/>
		);
	};

	_fetchNextPage = () => {
		const offset = this.props.users.length;
		const fetchOptions = Object.assign( {}, this.props.fetchOptions, { offset: offset } );
		analytics.ga.recordEvent( 'People', 'Fetched more users with infinite list', 'offset', offset );
		debug( 'fetching next batch of users' );
		UsersActions.fetchUsers( fetchOptions );
	};

	_getPersonRef = user => {
		return 'user-' + user.ID;
	};

	_renderLoadingPeople = () => {
		return <PeopleListItem key="people-list-item-placeholder" />;
	};
}

export default localize( Team );
