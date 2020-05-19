/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import deterministicStringify from 'fast-json-stable-stringify';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';
import React from 'react';
import debugFactory from 'debug';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import classNames from 'classnames';
import PeopleListItem from 'my-sites/people/people-list-item';
import { fetchUsers } from 'lib/users/actions';
import InfiniteList from 'components/infinite-list';
import NoResults from 'my-sites/no-results';
import PeopleListSectionHeader from 'my-sites/people/people-list-section-header';
import ListEnd from 'components/list-end';
import { recordGoogleEvent } from 'state/analytics/actions';

const debug = debugFactory( 'calypso:my-sites:people:team-list' );

class Team extends React.Component {
	static displayName = 'Team';

	constructor() {
		super();

		this.infiniteList = React.createRef();
	}

	state = {
		bulkEditing: false,
	};

	isLastPage = () =>
		this.props.totalUsers <= this.props.users.length + this.props.excludedUsers.length;

	render() {
		const key = deterministicStringify( omit( this.props.fetchOptions, [ 'number', 'offset' ] ) ),
			listClass = classNames( {
				'bulk-editing': this.state.bulkEditing,
				'people-invites__invites-list': true,
			} );
		let people;
		let headerText;
		if ( this.props.totalUsers ) {
			headerText = this.props.translate(
				'There is %(numberPeople)d person in your team',
				'There are %(numberPeople)d people in your team',
				{
					args: {
						numberPeople: this.props.totalUsers,
					},
					count: this.props.totalUsers,
					context: 'A navigation label.',
				}
			);
		}

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
					className="team-list__infinite is-people"
					ref={ this.infiniteList }
					fetchingNextPage={ this.props.fetchingUsers }
					lastPage={ this.isLastPage() }
					fetchNextPage={ this.fetchNextPage }
					getItemRef={ this.getPersonRef }
					renderLoadingPlaceholders={ this.renderLoadingPeople }
					renderItem={ this.renderPerson }
					guessedItemHeight={ 126 }
				/>
			);
		} else {
			people = this.renderLoadingPeople();
		}

		return (
			<div>
				<PeopleListSectionHeader
					label={ headerText }
					site={ this.props.site }
					isPlaceholder={ this.props.fetchingUsers || this.props.fetchOptions.search }
				/>
				<Card className={ listClass }>{ people }</Card>
				{ this.isLastPage() && <ListEnd /> }
			</div>
		);
	}

	renderPerson = ( user ) => {
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

	fetchNextPage = () => {
		const offset = this.props.users.length;
		const fetchOptions = Object.assign( {}, this.props.fetchOptions, { offset: offset } );
		this.props.recordGoogleEvent(
			'People',
			'Fetched more users with infinite list',
			'offset',
			offset
		);
		debug( 'fetching next batch of users' );
		fetchUsers( fetchOptions );
	};

	getPersonRef = ( user ) => 'user-' + user.ID;

	renderLoadingPeople = () => <PeopleListItem key="people-list-item-placeholder" />;
}

export default connect( null, { recordGoogleEvent } )( localize( Team ) );
