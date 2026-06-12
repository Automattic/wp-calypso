import './style.scss';
import { userSitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { decodeEntities } from 'calypso/lib/formatting';
import { getStreamUrl } from 'calypso/reader/route';

interface UserTopSitesProps {
	userId: number;
	userLogin: string;
}

export default function UserTopSites( {
	userId,
	userLogin,
}: UserTopSitesProps ): JSX.Element | null {
	const { isFetching, data, error } = useQuery( userSitesQuery( userId ) );

	if ( isFetching ) {
		return (
			<div className="user-top-sites">
				<span className="skeleton" /> <span className="skeleton" />
			</div>
		);
	}

	if ( error?.message || ! data?.sites?.length ) {
		return null; // Toast notification appears in case of error.
	}

	const sitesCount = data.sites.length;
	const primarySite = data.sites[ 0 ]; // First site is primary site.
	const top2SubscribedSites = data.sites
		.slice( 1 ) // Exclude primary site from the list.
		.sort( ( a, b ) => b.subscribers_count - a.subscribers_count )
		.slice( 0, 2 );
	const topSites = [ primarySite, ...top2SubscribedSites ].map( ( site ) => ( {
		ID: String( site.ID ),
		siteId: site.ID ? String( site.ID ) : '',
		feedId: site.feed_ID ? String( site.feed_ID ) : '',
		name: site.name,
		feedUrl: site.URL,
		image: site.icon?.img || site.icon?.ico,
	} ) );

	return (
		<div className="user-top-sites">
			{ topSites.map( ( site ) => (
				<a
					key={ `user-profile-header-site-${ site.ID }` }
					className="user-top-site"
					href={ getStreamUrl( site.feedId, site.siteId ) ?? site.feedUrl }
				>
					<SiteIcon siteId={ Number( site.ID ) } iconUrl={ site.image } size={ 16 } />
					<p>{ decodeEntities( site.name ) }</p>
				</a>
			) ) }

			{ sitesCount > 3 && (
				<a className="user-top-site" href={ `/reader/users/${ userLogin }/sites` }>
					{ `+${ sitesCount - 3 }` }
				</a>
			) }
		</div>
	);
}
