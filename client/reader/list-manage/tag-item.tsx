/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { Button } from '@automattic/components';
import SitePlaceholder from 'blocks/site/placeholder';
import { Item, Tag } from './types';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export default function TagItem( props: { item: Item; onRemove: ( e: MouseEvent ) => void } ) {
	const tag: Tag = props.item.meta?.data?.tag?.tag as Tag;

	return ! tag ? (
		// TODO: Add support for removing invalid tag list item
		<SitePlaceholder />
	) : (
		<>
			<div className="tag-item list-item">
				<a className="list-item__content" href={ `/read/tag/${ encodeURIComponent( tag.slug ) }` }>
					<div className="list-item__icon">
						<Gridicon icon="tag" size={ 36 } />
					</div>

					<div className="list-item__info">
						<div className="list-item__title">{ tag.display_name || tag.slug }</div>
						<div className="list-item__domain">{ tag.slug }</div>
					</div>
				</a>
			</div>
			<Button scary primary onClick={ props.onRemove }>
				Remove from list
			</Button>
		</>
	);
}
