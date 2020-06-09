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
import { Item, Site } from './types';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export default function SiteItem( props: { item: Item; onRemove: ( e: MouseEvent ) => void } ) {
	const site: Site = props.item.meta.data?.site as Site;

	if ( ! site ) {
		// TODO: Add support for removing invalid site list item
		return <SitePlaceholder />;
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
						<div className="list-item__domain">{ site.description || site.feed_URL }</div>
					</div>
				</a>
			</div>
			<Button scary primary onClick={ props.onRemove }>
				Remove from list
			</Button>
		</>
	);
}
