import './style.scss';
import { readListItemsQuery } from '@automattic/api-queries';
import { Button } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { Icon, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import FollowButton from 'calypso/blocks/follow-button/button';
import AutoDirection from 'calypso/components/auto-direction';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { isExternal } from 'calypso/lib/url';

interface ReaderListHeaderProps {
	list?: {
		ID: number;
		slug: string;
		title: string;
		description: string;
		owner: string;
		is_owner: boolean;
		is_public: boolean;
	};
	currentUser?: {
		username: string;
	};
	following: boolean;
	onFollowToggle: ( isFollowing: boolean ) => void;
	view: 'posts' | 'sites';
}

const ReaderListHeader = ( props: ReaderListHeaderProps ) => {
	const translate = useTranslate();
	const { list, following, onFollowToggle, view } = props;
	const isPublic = list?.is_public;
	const editUrl = list?.is_owner ? `/reader/list/${ list.owner }/${ list.slug }/edit` : '';
	const { data: listItemsData } = useQuery(
		readListItemsQuery( list?.owner ?? '', list?.slug ?? '' )
	);
	const totalItems = listItemsData?.total_items;
	let title: string | JSX.Element | undefined = list?.title;
	if ( list ) {
		// Show author name in parentheses if the list is owned by someone other than the current user
		const isOwnedByCurrentUser = props.currentUser && list.owner === props.currentUser.username;
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

	return (
		<>
			<AutoDirection>
				<NavigationHeader title={ formattedTitle } subtitle={ formattedDescription }>
					{ ! isPublic && (
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
