import { FEATURE_UNLIMITED_SUBSCRIBERS } from '@automattic/calypso-products';
import { Card, Button } from '@automattic/components';
import { AddSubscriberForm } from '@automattic/subscriber';
import { useTranslate } from 'i18n-calypso';
import SubscriptionsModuleBanner from 'calypso/blocks/subscriptions-module-banner';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import InfiniteList from 'calypso/components/infinite-list';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { addQueryArgs } from 'calypso/lib/url';
import NoResults from 'calypso/my-sites/no-results';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { isBusinessTrialSite } from 'calypso/sites-dashboard/utils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleListSectionHeader from '../people-list-section-header';
import type { FollowersQuery } from './types';
import type { Member } from '@automattic/data-stores';
import './style.scss';
import type { AppState } from 'calypso/types';

interface Props {
	filter: string;
	search?: string;
	followersQuery: FollowersQuery;
}
function Subscribers( props: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { search, followersQuery } = props;
	const site = useSelector( getSelectedSite );
	const hasUnlimitedSubscribers = useSelector( ( state: AppState ) =>
		siteHasFeature( state, site?.ID, FEATURE_UNLIMITED_SUBSCRIBERS )
	);

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

	const isFreeSite = site?.plan?.is_free ?? false;
	const isBusinessTrial = site ? isBusinessTrialSite( site ) : false;
	const hasSubscriberLimit = ( isFreeSite || isBusinessTrial ) && ! hasUnlimitedSubscribers;

	switch ( templateState ) {
		case 'default':
		case 'loading':
			return (
				<>
					<SubscriptionsModuleBanner />

					<PeopleListSectionHeader
						isPlaceholder={ isLoading }
						label={ translate(
							'You have %(number)d subscriber',
							'You have %(number)d subscribers',
							{
								args: { number: subscribersTotal as number },
								count: subscribersTotal as number,
							}
						) }
					>
						<Button compact primary href={ addSubscribersLink }>
							{ translate( 'Add subscribers' ) }
						</Button>
						<EllipsisMenu compact position="bottom">
							<PopoverMenuItem href={ downloadCsvLink } onClick={ onDownloadCsvClick }>
								{ translate( 'Download email subscribers as CSV' ) }
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
								noticeText={ translate( 'You must verify your email to add subscribers.' ) }
								noticeStatus="is-info"
							>
								<AddSubscriberForm
									siteId={ site?.ID }
									submitBtnAlwaysEnable
									onImportFinished={ refetch }
									hasSubscriberLimit={ hasSubscriberLimit }
								/>
							</EmailVerificationGate>
						</>
					) }
				</Card>
			);

		case 'no-result':
			return (
				<Card>
					<NoResults
						image="/calypso/images/people/mystery-person.svg"
						text={ translate( 'No results found for {{em}}%(searchTerm)s{{/em}}', {
							args: { searchTerm: search as string },
							components: { em: <em /> },
						} ) }
					/>
				</Card>
			);
	}

	return null;
}

export default Subscribers;
