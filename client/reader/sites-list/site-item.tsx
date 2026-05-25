import { filterURLForDisplay } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { SiteIcon } from 'calypso/blocks/site-icon';
import AutoDirection from 'calypso/components/auto-direction';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { getStreamUrl } from 'calypso/reader/route';
import { useSelector, useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { getSite } from 'calypso/state/reader/sites/selectors';
import type { SiteDetails } from '@automattic/data-stores';

interface ReaderSiteItemProps {
	site: ReaderSite;
	variant: 'card' | 'compact' | 'default';
	followSource: string;
	followIconSize?: number;
	siteIconSize?: number;
}

export interface ReaderSite {
	siteId?: string;
	feedId?: string;
	name?: string;
	feedUrl?: string;
	image?: string;
}

export function ReaderSiteItem( {
	site,
	variant,
	followSource,
	followIconSize = 24,
	siteIconSize = 42,
}: ReaderSiteItemProps ): JSX.Element {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { image, name, feedUrl = '', siteId, feedId } = site;
	const siteDetails = useSelector( ( state ) => getSite( state, Number( siteId ) ) ) as SiteDetails;
	const siteIcon = siteDetails?.icon?.img || siteDetails?.icon?.ico || image;
	const isCompactView = variant === 'compact';
	const linkUrl = getStreamUrl( feedId, siteId ) ?? feedUrl;

	function onFollowToggle( isFollowing: boolean ): void {
		const displayName: string = name || filterURLForDisplay( feedUrl ?? '' );

		dispatch(
			successNotice(
				isFollowing
					? translate( 'Success! You are now subscribed to %s.', { args: displayName } )
					: translate( 'Success! You are now unsubscribed from "%s".', { args: displayName } ),
				{ duration: 2000 }
			)
		);
	}

	return (
		<li className="reader-site-item">
			{ /* Query the site not just for the icon, but to ensure it is properly loaded in follows state.
				One example being mapped domains: initial follows state may list by wpcom subdomain, and
				the url here might be of a mapped domain. The site request success also updates follows
				state, and can bridge the gap to appropriately determine if a site from this list is
				followed.
			*/ }
			<QueryReaderSite siteId={ siteId } />

			<a
				className="reader-site-item__link"
				href={ linkUrl }
				style={ { width: `calc(100% - ${ followIconSize + 4 }px)` } }
			>
				<SiteIcon iconUrl={ siteIcon } size={ siteIconSize } />

				<AutoDirection>
					<div className="reader-site-info">
						<h3>{ name || feedUrl }</h3>
						{ ! isCompactView && (
							<p>{ siteDetails?.description || translate( 'No description.' ) }</p>
						) }
					</div>
				</AutoDirection>
			</a>

			{ feedUrl && (
				<ReaderFollowButton
					className="reader-site-subscribe-button"
					feedId={ feedId ? Number( feedId ) : undefined }
					siteId={ siteId ? Number( siteId ) : undefined }
					siteUrl={ feedUrl }
					iconSize={ followIconSize }
					followSource={ followSource }
					isButtonOnly={ isCompactView }
					onFollowToggle={ onFollowToggle }
				/>
			) }
		</li>
	);
}
