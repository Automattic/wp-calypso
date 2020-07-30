/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import SitePlaceholder from 'blocks/site/placeholder';
import Gridicon from 'components/gridicon';
import { Item, Site, SiteError } from './types';

function isSiteError( site: Site | SiteError ): site is SiteError {
	return 'errors' in site;
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
					<div className="list-item__title">{ site.name || site.URL || site.feed_URL }</div>
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
export default function SiteItem( props: { item: Item; onRemove: ( e: MouseEvent ) => void } ) {
	const site: Site | SiteError = props.item.meta?.data?.site as Site | SiteError;

	if ( ! site ) {
		// TODO: Add support for removing invalid site list item
		return <SitePlaceholder />;
	}

	return (
		<>
			{ isSiteError( site ) ? renderSiteError( site ) : renderSite( site ) }
			<Button scary primary onClick={ props.onRemove }>
				Remove from list
			</Button>
		</>
	);
}
