/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import InfiniteList from 'calypso/components/infinite-list';
import ListEnd from 'calypso/components/list-end';
import withP2Guests from 'calypso/data/p2/with-p2-guests';
import NoResults from 'calypso/my-sites/no-results';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import PeopleListSectionHeader from 'calypso/my-sites/people/people-list-section-header';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class Team extends Component {
	infiniteList = createRef();

	renderPerson = ( user ) => (
		<PeopleListItem key={ user.ID } user={ user } type="user" site={ this.props.site } />
	);

	getPersonRef = ( user ) => 'user-' + user.ID;

	renderLoadingPeople = () => <PeopleListItem key="people-list-item-placeholder" />;

	getP2headerText = () => {
		const { p2Guests, totalUsers, isP2HubSite, translate } = this.props;
		const translateOptions = {
			args: {
				numberPeople: totalUsers,
			},
			count: totalUsers,
			context: 'A navigation label.',
		};

		if ( isP2HubSite ) {
			return translate(
				'There is %(numberPeople)d member in this workspace',
				'There are %(numberPeople)d members in this workspace',
				translateOptions
			);
		}

		if ( ! p2Guests?.found ) {
			return translate(
				'There is %(numberPeople)d member in this P2',
				'There are %(numberPeople)d members in this P2',
				translateOptions
			);
		}

		const guests = translate( '%(numberGuests)d guest', '%(numberGuests)d guests', {
			args: {
				numberGuests: p2Guests.found,
			},
			count: p2Guests.found,
		} );

		const numMembers = totalUsers - p2Guests.found;
		return translate(
			'There is %(numMembers)d member and %(guests)s in this P2',
			'There are %(numMembers)d members and %(guests)s in this P2',
			{
				args: {
					numMembers,
					guests,
				},
				count: numMembers,
				context: 'A navigation label.',
				comment:
					'%(guests)s is a separate translated string that expands to %(numberGuests)d guest',
			}
		);
	};

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
			isWPForTeamsSite,
		} = this.props;

		let people;
		let headerText;

		if ( totalUsers ) {
			if ( isWPForTeamsSite ) {
				headerText = this.getP2headerText();
			} else {
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

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
			isP2HubSite: isSiteP2Hub( state, siteId ),
		};
	},
	{ recordGoogleEvent }
)( localize( withP2Guests( Team ) ) );
