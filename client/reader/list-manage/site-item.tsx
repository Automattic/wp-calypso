/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import SitePlaceholder from 'blocks/site/placeholder';
import Gridicon from 'components/gridicon';
import QueryReaderSite from 'components/data/query-reader-site';
import { getSite } from 'state/reader/sites/selectors';
import { Item, Site } from './types';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export default function SiteItem( props: { item: Item; onRemove: ( e: MouseEvent ) => void } ) {
	const siteId = props.item.site_ID as number;
	const site: Site = useSelector( ( state ) => getSite( state, siteId ) ) as Site;

	if ( ! site ) {
		return (
			<>
				<QueryReaderSite siteId={ siteId } />
				<SitePlaceholder />
			</>
		);
	}

	return (
		<>
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
						<div className="list-item__domain">{ site.feed_URL }</div>
					</div>
				</a>
			</div>
			<Button scary primary onClick={ props.onRemove }>
				Remove from list
			</Button>
		</>
	);
}
