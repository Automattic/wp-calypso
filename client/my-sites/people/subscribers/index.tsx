import { Card, Button } from '@automattic/components';
import { AddSubscriberForm } from '@automattic/subscriber';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import InfiniteList from 'calypso/components/infinite-list';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { addQueryArgs } from 'calypso/lib/url';
import NoResults from 'calypso/my-sites/no-results';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleListSectionHeader from '../people-list-section-header';
import type { Member } from '../types';
import type { FollowersQuery } from './types';

import './style.scss';

interface Props {
	filter: string;
	search?: string;
	followersQuery: FollowersQuery;
}
function Subscribers( props: Props ) {
	const _ = useTranslate();
	const dispatch = useDispatch();
	const { search, followersQuery } = props;
	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const listKey = [ 'subscribers', site?.ID, 'all', search ].join( '-' );
	const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage, refetch } =
		followersQuery;

	const subscribers = data?.followers || [];
	const subscribersTotal = data?.total;

	const addSubscribersLink = `/people/add-subscribers/${ site?.slug }`;
	const downloadCsvLink = addQueryArgs(
		{ page: 'stats', blog: site?.ID, blog_subscribers: 'csv', type: 'email' },
		'https://dashboard.wordpress.com/wp-admin/index.php'
	);

	function onDownloadCsvClick() {
		dispatch(
			recordGoogleEvent(
				'People',
				'Clicked Download email subscribers as CSV menu item on Subscribers'
			)
		);
	}

	function getFollowerRef( follower: Member ) {
		return 'follower-' + follower.ID;
	}

	function renderFollower( follower: Member ) {
		return (
			<PeopleListItem
				key={ follower?.ID }
				user={ follower }
				site={ site }
				type="subscriber-details"
			/>
		);
	}

	function renderPlaceholders() {
		return <PeopleListItem key="people-list-item-placeholder" />;
	}

	let templateState;
	if ( isLoading ) {
		templateState = 'loading';
	} else if ( search && ! subscribersTotal ) {
		templateState = 'no-result';
	} else if ( ! subscribersTotal ) {
		templateState = 'empty';
	} else {
		templateState = 'default';
	}

	switch ( templateState ) {
		case 'default':
		case 'loading':
			return (
				<>
					<PeopleListSectionHeader
						isPlaceholder={ isLoading }
						label={ _( 'You have %(number)d subscriber', 'You have %(number)d subscribers', {
							args: { number: subscribersTotal },
							count: subscribersTotal as number,
						} ) }
					>
						<Button compact primary href={ addSubscribersLink }>
							{ _( 'Add subscribers' ) }
						</Button>
						<EllipsisMenu compact position="bottom">
							<PopoverMenuItem href={ downloadCsvLink } onClick={ onDownloadCsvClick }>
								{ _( 'Download email subscribers as CSV' ) }
							</PopoverMenuItem>
						</EllipsisMenu>
					</PeopleListSectionHeader>
					<Card className="people-subscribers-list">
						{ isLoading && renderPlaceholders() }
						<InfiniteList
							listkey={ listKey }
							items={ subscribers }
							fetchNextPage={ fetchNextPage }
							fetchingNextPage={ isFetchingNextPage }
							lastPage={ ! hasNextPage }
							renderItem={ renderFollower }
							renderLoadingPlaceholders={ renderPlaceholders }
							guessedItemHeight={ 126 }
							getItemRef={ getFollowerRef }
						/>
					</Card>
				</>
			);

		case 'empty':
			return (
				<Card>
					{ site && (
						<>
							{ /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */ }
							{ /* @ts-ignore */ }
							<EmailVerificationGate
								noticeText={ _( 'You must verify your email to add subscribers.' ) }
								noticeStatus="is-info"
							>
								<AddSubscriberForm
									siteId={ site?.ID }
									submitBtnAlwaysEnable={ true }
									onImportFinished={ refetch }
								/>
							</EmailVerificationGate>
						</>
					) }
				</Card>
			);

		case 'no-result':
			return (
				<NoResults
					image="/calypso/images/people/mystery-person.svg"
					text={ _( 'No results found for {{em}}%(searchTerm)s{{/em}}', {
						args: { searchTerm: search },
						components: { em: <em /> },
					} ) }
				/>
			);
	}

	return null;
}

export default Subscribers;
