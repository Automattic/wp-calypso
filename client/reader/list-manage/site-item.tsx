/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import FollowButton from 'calypso/blocks/follow-button/button';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import Gridicon from 'calypso/components/gridicon';
import { addReaderListSite, deleteReaderListSite } from 'calypso/state/reader/lists/actions';
import { getMatchingItem } from 'calypso/state/reader/lists/selectors';
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
			<a className="list-item__content" href={ `/read/feeds/${ site.feed_ID }` }>
				<div className="list-item__icon">
					{ site.icon?.img && (
						<img src={ site.icon.img } className="list-item__img image" alt="" />
					) }
					{ ! site.icon?.img && <Gridicon icon="site" size={ 36 } /> }
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
} ): React.ReactElement | null {
	const { item, list, owner } = props;
	const site = props.item.meta?.data?.site as Site | SiteError;
	const dispatch = useDispatch();
	const translate = useTranslate();

	const isInList = !! useSelector( ( state ) =>
		getMatchingItem( state, { siteId: props.item.site_ID, listId: props.list.ID } )
	);

	const [ showDeleteConfirmation, setShowDeleteConfirmation ] = React.useState( false );
	const addItem = () => dispatch( addReaderListSite( list.ID, owner, list.slug, item.site_ID ) );
	const deleteItem = ( shouldDelete: boolean ) => {
		setShowDeleteConfirmation( false );
		shouldDelete && dispatch( deleteReaderListSite( list.ID, owner, list.slug, item.site_ID ) );
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

			{ props.isFollowed && (
				<FollowButton followLabel={ translate( 'Following site' ) } following />
			) }

			{ ! isInList ? (
				<Button primary onClick={ addItem }>
					{ translate( 'Add' ) }
				</Button>
			) : (
				<Button primary onClick={ () => setShowDeleteConfirmation( true ) }>
					{ translate( 'Remove' ) }
				</Button>
			) }

			<ItemRemoveDialog
				onClose={ deleteItem }
				title={ <SiteTitle site={ site } /> }
				type="site"
				visibility={ showDeleteConfirmation }
			/>
		</Card>
	);
}
