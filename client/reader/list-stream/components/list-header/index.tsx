import './style.scss';
import { Button } from '@automattic/components';
import { Icon, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import FollowButton from 'calypso/blocks/follow-button/button';
import AutoDirection from 'calypso/components/auto-direction';
import DocumentHead from 'calypso/components/data/document-head';
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
	onFollowToggle: () => void;
	view: 'posts' | 'sites';
}

const ReaderListHeader = ( props: ReaderListHeaderProps ) => {
	const translate = useTranslate();
	const { list, following, onFollowToggle, view } = props;
	const isPublic = list?.is_public;
	const editUrl = list?.is_owner ? `/reader/list/${ list.owner }/${ list.slug }/edit` : '';
	let title: string | JSX.Element | undefined = list?.title;
	if ( list ) {
		// Show author name in parentheses if the list is owned by someone other than the current user
		const isOwnedByCurrentUser = props.currentUser && list.owner === props.currentUser.username;
		// Show author name in parentheses if the list is owned by someone other than the current user
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
			<div>{ title }</div>
		</AutoDirection>
	);

	const formattedDescription = (
		<AutoDirection>
			<div>{ list?.description }</div>
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
		},
	];

	return (
		<>
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: list?.title,
					comment: '%s is the section name. For example: "My Likes"',
				} ) }
			/>

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

					{ ! list?.is_owner && (
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
							<NavItem key={ item.path } path={ item.path } selected={ item.selected }>
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
