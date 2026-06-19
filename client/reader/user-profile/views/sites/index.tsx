import { userSitesQuery, userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@wordpress/components';
import { siteLogo, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import { decodeEntities } from 'calypso/lib/formatting';
import { ReaderSitesList } from 'calypso/reader/sites-list';
import { ReaderSite } from 'calypso/reader/sites-list/site-item';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { ReaderUser } from '@automattic/api-core';
import type { JSX } from 'react';

interface UserSitesProps {
	user: ReaderUser;
}

const UserSites = ( { user }: UserSitesProps ): JSX.Element | null => {
	const { ID: userId, user_login: userLogin } = user;
	const translate = useTranslate();
	const currentUser = useSelector( getCurrentUser );
	const isOwnProfile = currentUser?.username === userLogin;
	// The owner reads their full site list (shared with the settings card) and filters it by their
	// hidden-sites preference, which updates in real time as they toggle sites in settings. Public
	// viewers read the public list and rely on the server-set `is_hidden` flag.
	const { isLoading, data, error } = useQuery( userSitesQuery( userId, { owner: isOwnProfile } ) );
	const { data: hiddenSites = [] } = useQuery( {
		...userPreferenceQuery( 'reader-profile-hidden-sites' ),
		enabled: isOwnProfile,
	} );

	const visibleSites = ( data?.sites ?? [] ).filter( ( site ) =>
		isOwnProfile ? ! hiddenSites.includes( site.ID ) : ! site.is_hidden
	);

	if ( isLoading ) {
		return (
			<div className="wp-spinner-wrapper">
				<Spinner />
				<p>{ translate( 'Loading sites' ) }</p>
			</div>
		);
	}

	if ( error ) {
		return (
			<EmptyContent
				title={ translate( 'Sorry, something went wrong.' ) }
				line={ translate( 'We couldn’t load the sites. Please try again.' ) }
			/>
		);
	}

	if ( ! visibleSites.length ) {
		const action = isOwnProfile && (
			<a
				className="empty-content__action button is-primary"
				href="/start?source=reader&ref=user-profile-page"
			>
				{ translate( 'Create your first site' ) }
			</a>
		);
		return (
			<EmptyContent
				illustration={ null }
				icon={ <Icon icon={ siteLogo } size={ 48 } /> }
				title={ null }
				line={ translate( 'No sites have been created yet.' ) }
				action={ action }
			/>
		);
	}

	const sitesList = visibleSites.map( ( site ): ReaderSite => {
		return {
			siteId: site.ID ? String( site.ID ) : '',
			feedId: site.feed_ID ? String( site.feed_ID ) : '',
			name: decodeEntities( site.name ),
			feedUrl: site.URL,
			image: site.icon?.img || site.icon?.ico || '',
		};
	} );

	return (
		<ReaderSitesList
			sites={ sitesList }
			followSource="user-profile-page__sites-tab__list"
			variant="card"
		/>
	);
};

export default UserSites;
