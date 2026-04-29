/* eslint-disable wpcalypso/jsx-classname-namespace */

import {
	addReadListFeedMutation,
	deleteReadListSiteMutation,
	readListItemsAllQuery,
} from '@automattic/api-queries';
import { Button, Card, Gridicon } from '@automattic/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FollowButton from 'calypso/blocks/follow-button/button';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
import ItemRemoveDialog from './item-remove-dialog';
import { Item, List, Site, SiteError } from './types';

function isSiteError( site: Site | SiteError ): site is SiteError {
	return 'errors' in site;
}

function SiteTitle( { site: { name, URL, feed_URL } }: { site: Site } ) {
	return <>{ name || URL || feed_URL }</>;
}

function renderSite( site: Site ) {
	return (
		<div className="site-item list-item">
			<a className="list-item__content" href={ `/reader/feeds/${ site.feed_ID }` }>
				<div className="list-item__icon">
					<SiteIcon iconUrl={ site.icon?.img } />
				</div>

				<div className="list-item__info">
					<div className="list-item__title">
						<SiteTitle site={ site } />
					</div>
					<div className="list-item__domain">{ site.description || site.feed_URL }</div>
				</div>
			</a>
		</div>
	);
}

function renderSiteError( err: SiteError ) {
	return (
		<div className="site-item list-item is-error">
			<div className="list-item__content">
				<div className="list-item__icon">
					<Gridicon icon="notice" size={ 24 } />
				</div>

				<div className="list-item__info">
					<div className="list-item__title">
						{ err.error_data.site_gone ? 'Site has been deleted' : 'Unknown error' }
					</div>
					<div className="list-item__domain"></div>
				</div>
			</div>
		</div>
	);
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
export default function SiteItem( props: {
	hideIfInList?: boolean;
	isFollowed?: boolean;
	item: Item;
	list: List;
	owner: string;
	hideFollowButton?: boolean;
} ) {
	const { item, list, owner } = props;
	const site = props.item.meta?.data?.site as Site | SiteError | undefined;
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const { mutate: addFeed } = useMutation( addReadListFeedMutation( queryClient ) );
	const { mutate: deleteSite } = useMutation( deleteReadListSiteMutation( queryClient ) );

	const { data: isInList = false } = useQuery( {
		...readListItemsAllQuery( owner, list.slug ),
		select: ( itemsData ) =>
			!! item.site_ID &&
			!! itemsData?.items?.some(
				( listItem ) => Number( listItem.site_ID ) === Number( item.site_ID )
			),
	} );
	const isRecommendedBlogsList = list.slug === 'recommended-blogs';

	const [ showDeleteConfirmation, setShowDeleteConfirmation ] = useState( false );
	const addItem = () => {
		if ( ! item.site_ID ) {
			return;
		}
		// Legacy quirk: sites are added via the feeds endpoint with the site_ID
		// passed as feed_id. Preserve that behavior.
		addFeed(
			{ owner, slug: list.slug, feedId: Number( item.site_ID ) },
			{
				onSuccess: () => {
					dispatch(
						successNotice(
							isRecommendedBlogsList
								? translate( 'Recommendation successfully added.' )
								: translate( 'Feed added to list successfully.' ),
							{ duration: DEFAULT_NOTICE_DURATION }
						)
					);
				},
				onError: () => {
					dispatch(
						errorNotice(
							isRecommendedBlogsList
								? translate( 'Unable to add recommendation.' )
								: translate( 'Unable to add feed to list.' )
						)
					);
				},
			}
		);
	};
	const deleteItem = ( shouldDelete: boolean ) => {
		setShowDeleteConfirmation( false );
		if ( ! shouldDelete || ! item.site_ID ) {
			return;
		}
		deleteSite(
			{ owner, slug: list.slug, siteId: Number( item.site_ID ) },
			{
				onSuccess: () => {
					dispatch(
						successNotice( translate( 'Site removed from list successfully.' ), {
							duration: DEFAULT_NOTICE_DURATION,
						} )
					);
				},
				onError: () => {
					dispatch( errorNotice( translate( 'Unable to remove site from list.' ) ) );
				},
			}
		);
	};

	if ( isInList && props.hideIfInList ) {
		return null;
	}

	if ( ! site ) {
		// TODO: Add support for removing invalid site list item
		return (
			<Card className="list-manage__site-card">
				<SitePlaceholder />
			</Card>
		);
	}

	return (
		<Card className="list-manage__site-card">
			{ isSiteError( site ) ? renderSiteError( site ) : renderSite( site ) }

			{ props.isFollowed && ! props.hideFollowButton && (
				<FollowButton followLabel={ translate( 'Following site' ) } following />
			) }

			{ ! isInList ? (
				<Button primary onClick={ addItem }>
					{ isRecommendedBlogsList ? translate( 'Recommend' ) : translate( 'Add' ) }
				</Button>
			) : (
				<Button primary onClick={ () => setShowDeleteConfirmation( true ) }>
					{ translate( 'Remove' ) }
				</Button>
			) }

			{ ! isSiteError( site ) && (
				<ItemRemoveDialog
					onClose={ deleteItem }
					title={ <SiteTitle site={ site } /> }
					type="site"
					visibility={ showDeleteConfirmation }
				/>
			) }
		</Card>
	);
}
