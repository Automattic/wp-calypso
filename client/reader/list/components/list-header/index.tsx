import './style.scss';
import {
	followReadListMutation,
	readListItemsQuery,
	readSubscribedListsQuery,
	unfollowReadListMutation,
} from '@automattic/api-queries';
import { Button } from '@automattic/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import FollowButton from 'calypso/blocks/follow-button/button';
import AutoDirection from 'calypso/components/auto-direction';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { isExternal } from 'calypso/lib/url';
import { ReaderList } from 'calypso/reader/list-manage/types';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import type { AppState } from 'calypso/types';

interface ReaderListHeaderProps {
	list?: ReaderList;
	view: 'posts' | 'sites';
}

const ReaderListHeader = ( props: ReaderListHeaderProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const queryClient = useQueryClient();
	const { list, view } = props;
	const currentUser = useSelector( ( state: AppState ) => getCurrentUser( state ) );
	const { data: subscribedListsData, isSuccess: hasSubscribedListsData } = useQuery( {
		...readSubscribedListsQuery(),
		enabled: !! currentUser,
	} );
	const following = Boolean(
		hasSubscribedListsData &&
			list &&
			subscribedListsData?.lists.some(
				( subscribed ) => subscribed.owner === list.owner && subscribed.slug === list.slug
			)
	);
	const { mutate: followList } = useMutation( followReadListMutation( queryClient ) );
	const { mutate: unfollowList } = useMutation( unfollowReadListMutation( queryClient ) );
	const editUrl = list?.is_owner ? `/reader/list/${ list.owner }/${ list.slug }/edit` : '';
	const { data: listItemsData } = useQuery(
		readListItemsQuery( list?.owner ?? '', list?.slug ?? '' )
	);
	const totalItems = listItemsData?.total_items;
	let title: string | JSX.Element | undefined = list?.title;
	if ( list ) {
		// Show author name in parentheses if the list is owned by someone other than the current user
		const isOwnedByCurrentUser = currentUser && list.owner === currentUser.username;
		title = isOwnedByCurrentUser ? (
			title
		) : (
			<>
				{ title } (<a href={ `/reader/users/${ list.owner }` }>{ list.owner }</a>)
			</>
		);
	}

	const formattedTitle = (
		<AutoDirection>
			<span>{ title }</span>
		</AutoDirection>
	);

	const formattedDescription = (
		<AutoDirection>
			<span>{ list?.description }</span>
		</AutoDirection>
	);

	const listBaseUrl =
		list?.owner && list?.slug ? `/reader/list/${ list.owner }/${ list.slug }` : '';
	const navigationItems = [
		{
			label: translate( 'Posts' ),
			path: listBaseUrl,
			selected: view === 'posts',
		},
		{
			label: translate( 'Sites' ),
			path: `${ listBaseUrl }/sites`,
			selected: view === 'sites',
			count: totalItems,
		},
	];

	function onFollowToggle( isFollowRequested: boolean ): void {
		if ( ! list ) {
			return;
		}

		if ( isFollowRequested ) {
			followList(
				{ owner: list.owner, slug: list.slug },
				{
					onError: () => {
						dispatch( errorNotice( translate( 'Unable to follow list.' ) ) );
					},
				}
			);
		} else {
			unfollowList(
				{ owner: list.owner, slug: list.slug },
				{
					onError: () => {
						dispatch( errorNotice( translate( 'Unable to unfollow list.' ) ) );
					},
				}
			);
		}

		recordAction( isFollowRequested ? 'followed_list' : 'unfollowed_list' );
		recordGaEvent(
			isFollowRequested ? 'Clicked Follow List' : 'Clicked Unfollow List',
			list.owner + ':' + list.slug
		);
		recordReaderTracksEvent(
			isFollowRequested
				? 'calypso_reader_reader_list_followed'
				: 'calypso_reader_reader_list_unfollowed',
			{
				list_owner: list.owner,
				list_slug: list.slug,
			}
		);
	}

	return (
		<>
			<AutoDirection>
				<NavigationHeader title={ formattedTitle } subtitle={ formattedDescription }>
					{ list?.is_public === false && (
						<div
							className="list-stream__header-title-privacy"
							title={ translate( 'Private list' ) }
						>
							<Icon icon={ lock } size={ 24 } />
						</div>
					) }

					{ list && ! list?.is_owner && (
						<div className="list-stream__header-follow">
							<FollowButton
								iconSize={ 24 }
								following={ following }
								onFollowToggle={ onFollowToggle }
							/>
						</div>
					) }

					{ list?.is_owner && editUrl && (
						<div className="list-stream__header-edit">
							<Button rel={ isExternal( editUrl ) ? 'external' : '' } href={ editUrl }>
								{ translate( 'Edit' ) }
							</Button>
						</div>
					) }
				</NavigationHeader>
			</AutoDirection>

			{ listBaseUrl && (
				<SectionNav className="list-stream__nav" enforceTabsView variation="minimal">
					<NavTabs>
						{ navigationItems.map( ( item ) => (
							<NavItem
								key={ item.path }
								path={ item.path }
								selected={ item.selected }
								count={ item.count }
							>
								{ item.label }
							</NavItem>
						) ) }
					</NavTabs>
				</SectionNav>
			) }
		</>
	);
};

export default ReaderListHeader;
