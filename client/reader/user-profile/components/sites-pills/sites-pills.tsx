import './style.scss';
import { SiteIcon } from 'calypso/blocks/site-icon';
import useUserSitesQuery from 'calypso/reader/user-profile/queries/use-user-sites-query';

interface UserSitesPillsProps {
	userId: number;
	userLogin: string;
}

export default function UserSitesPills( {
	userId,
	userLogin,
}: UserSitesPillsProps ): JSX.Element | null {
	const { isFetching, data, error } = useUserSitesQuery( userId );

	if ( isFetching ) {
		return (
			<div className="user-sites-pills">
				<span className="skeleton" /> <span className="skeleton" /> <span className="skeleton" />
			</div>
		);
	}

	if ( error?.message || ! data?.sites?.length ) {
		return null; // Toast notification appears in case of error.
	}

	const sitesCount = data.sites.length;
	const primarySiteId = data.primary_site_id;
	const primarySite = data.sites.find( ( site ) => site.ID === primarySiteId ) ?? data.sites[ 0 ]; // Fallback to the first site if primary site is not found.
	const top2SubscribedSites = data.sites
		.filter( ( site ) => site.ID !== primarySite.ID ) // Exclude primary site
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

	function getAnchorLink( site: ( typeof topSites )[ 0 ] ): string {
		if ( site.feedId ) {
			return `/reader/feeds/${ site.feedId }`;
		}

		if ( site.siteId ) {
			return `/reader/blogs/${ site.siteId }`;
		}

		return site.feedUrl || '#';
	}

	return (
		<div className="user-sites-pills">
			{ topSites.map( ( site ) => (
				<a
					key={ `user-profile-header-site-${ site.ID }` }
					className="user-site-pill"
					href={ getAnchorLink( site ) }
				>
					<SiteIcon siteId={ Number( site.ID ) } iconUrl={ site.image } size={ 16 } />
					<p>{ site.name }</p>
				</a>
			) ) }

			{ sitesCount > 3 && (
				<a className="user-site-pill" href={ `/reader/users/${ userLogin }/sites` }>
					{ `+${ sitesCount - 3 }` }
				</a>
			) }
		</div>
	);
}
