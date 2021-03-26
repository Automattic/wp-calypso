/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import InfiniteList from 'calypso/components/infinite-list';
import NoResults from 'calypso/my-sites/no-results';
import PeopleListSectionHeader from 'calypso/my-sites/people/people-list-section-header';
import ListEnd from 'calypso/components/list-end';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

class Team extends React.Component {
	infiniteList = React.createRef();

	renderPerson = ( user ) => (
		<PeopleListItem key={ user.ID } user={ user } type="user" site={ this.props.site } />
	);

	getPersonRef = ( user ) => 'user-' + user.ID;

	renderLoadingPeople = () => <PeopleListItem key="people-list-item-placeholder" />;

	render() {
		const {
			site,
			users,
			listKey,
			search,
			fetchingUsers,
			fetchingNextPage,
			totalUsers,
			hasNextPage,
			fetchNextPage,
			translate,
		} = this.props;

		let people;
		let headerText;

		if ( totalUsers ) {
			headerText = translate(
				'There is %(numberPeople)d person in your team',
				'There are %(numberPeople)d people in your team',
				{
					args: {
						numberPeople: totalUsers,
					},
					count: totalUsers,
					context: 'A navigation label.',
				}
			);
		}

		if ( ! users.length && search && ! fetchingUsers ) {
			return (
				<NoResults
					image="/calypso/images/people/mystery-person.svg"
					text={ translate( 'No results found for {{em}}%(searchTerm)s{{/em}}', {
						args: { searchTerm: search },
						components: { em: <em /> },
					} ) }
				/>
			);
		}

		if ( site && users.length ) {
			if ( search && totalUsers ) {
				headerText = translate(
					'%(numberPeople)d Person Matching {{em}}"%(searchTerm)s"{{/em}}',
					'%(numberPeople)d People Matching {{em}}"%(searchTerm)s"{{/em}}',
					{
						count: users.length,
						args: {
							numberPeople: totalUsers,
							searchTerm: search,
						},
						components: {
							em: <em />,
						},
					}
				);
			}

			people = (
				<InfiniteList
					key={ listKey }
					items={ users }
					className="team-list__infinite is-people"
					ref={ this.infiniteList }
					fetchingNextPage={ fetchingNextPage }
					lastPage={ ! hasNextPage }
					fetchNextPage={ fetchNextPage }
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
			<>
				<PeopleListSectionHeader
					label={ headerText }
					site={ site }
					isPlaceholder={ fetchingUsers }
				/>
				<Card className="people-invites__invites-list">{ people }</Card>
				{ ! hasNextPage && <ListEnd /> }
			</>
		);
	}
}

export default connect( null, { recordGoogleEvent } )( localize( Team ) );
