import './style.scss';
import { isAutomatticianQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useLayoutEffect, useRef, useState, type JSX } from 'react';
import GravatarIcon from 'calypso/assets/images/icons/gravatar.svg';
import UserAvatar from 'calypso/blocks/user-avatar';
import AutoDirection from 'calypso/components/auto-direction';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { decodeEntities } from 'calypso/lib/formatting';
import useAchievementsVisibility from 'calypso/reader/components/achievements/use-achievements-visibility';
import { useProfileTabVisibility } from 'calypso/reader/data/user-profile';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';
import UserTopSites from '../top-sites';
import type { ReaderUser } from '@automattic/api-core';

interface UserProfileHeaderProps {
	user: ReaderUser;
	view: string;
}

const UserProfileHeader = ( { user, view }: UserProfileHeaderProps ): JSX.Element => {
	const translate = useTranslate();
	const { isVisible: showAchievements, isPublic: isAchievementsPublic } = useAchievementsVisibility(
		user.user_login
	);
	const { isOwnProfile, showPosts, isPostsPublic, showSites, isSitesPublic } =
		useProfileTabVisibility( user.user_login );
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ showMoreToggle, setShowMoreToggle ] = useState( false );
	const bioRef = useRef< HTMLParagraphElement >( null );

	useLayoutEffect( () => {
		const bioElement = bioRef.current;
		if ( bioElement ) {
			const isOverflowing = bioElement.scrollHeight > bioElement.clientHeight;
			setShowMoreToggle( isOverflowing );
		}
	}, [ user.description ] );

	const handleShowMoreToggle = () => {
		setIsExpanded( ! isExpanded );
	};

	const userProfileUrl = getUserProfileUrl( user.user_login ?? String( user.ID ) );
	const navigationItems = [
		...( showPosts
			? [
					{
						className: clsx( { 'is-private': ! isPostsPublic } ),
						label: translate( 'Posts' ),
						path: userProfileUrl,
						selected: view === 'posts',
					},
			  ]
			: [] ),
		...( showSites
			? [
					{
						className: clsx( { 'is-private': ! isSitesPublic } ),
						label: translate( 'Sites' ),
						path: `${ userProfileUrl }/sites`,
						selected: view === 'sites',
					},
			  ]
			: [] ),
		{
			label: translate( 'Lists' ),
			path: `${ userProfileUrl }/lists`,
			selected: view === 'lists',
		},
		{
			label: translate( 'Recommended Blogs' ),
			path: `${ userProfileUrl }/recommended-blogs`,
			selected: view === 'recommended-blogs',
		},
		...( showAchievements
			? [
					{
						className: clsx( { 'is-private': ! isAchievementsPublic } ),
						label: translate( 'Achievements' ),
						path: `${ userProfileUrl }/achievements`,
						selected: view === 'achievements',
					},
			  ]
			: [] ),
		...( isOwnProfile && isAutomattician
			? [
					{
						label: translate( 'Settings' ),
						path: `${ userProfileUrl }/settings`,
						selected: view === 'settings',
					},
			  ]
			: [] ),
	];

	return (
		<>
			<header className="user-profile-header">
				<div className="user-profile-header__user-info">
					<UserAvatar user={ user } size={ 56 } hideHovercard />
					<div className="user-profile-header__names">
						<h1>
							{ decodeEntities( user.display_name ) }
							{ user.profile_URL && (
								<a
									className="user-profile-header__gravatar-badge"
									href={ user.profile_URL }
									target="_blank"
									rel="noopener noreferrer"
									aria-label={ translate( 'Go to Gravatar profile' ) }
								>
									<img
										src={ GravatarIcon }
										alt={ translate( 'Gravatar badge.' ) }
										width={ 18 }
										height={ 18 }
									/>
								</a>
							) }
						</h1>
						<p>
							<span dir="ltr">@{ user.user_login }</span>
						</p>
					</div>
				</div>

				{ user.description && (
					<AutoDirection>
						<div className="user-profile-header__bio">
							<p
								ref={ bioRef }
								className={ clsx( 'user-profile-header__bio-desc', {
									'is-clamped': ! isExpanded,
									'is-expanded': isExpanded,
								} ) }
							>
								{ decodeEntities( user.description ) }
							</p>
							{ showMoreToggle && (
								<button
									className="user-profile-header__bio-toggle"
									onClick={ handleShowMoreToggle }
									aria-hidden="true"
								>
									{ isExpanded ? translate( 'Show less' ) : translate( 'Show more' ) }
								</button>
							) }
						</div>
					</AutoDirection>
				) }

				{ showSites && user.ID && user.user_login && (
					<UserTopSites
						userId={ user.ID }
						userLogin={ user.user_login }
						isOwnProfile={ isOwnProfile }
					/>
				) }
			</header>
			<SectionNav enforceTabsView variation="minimal">
				<NavTabs>
					{ navigationItems.map( ( item ) => (
						<NavItem
							className={ item.className }
							key={ item.path }
							path={ item.path }
							selected={ item.selected }
						>
							{ item.label }
						</NavItem>
					) ) }
				</NavTabs>
			</SectionNav>
		</>
	);
};

export default UserProfileHeader;
