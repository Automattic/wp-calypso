/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Site from 'blocks/site';
import SitePlaceholder from 'blocks/site/placeholder';
import { getSite } from 'state/sites/selectors';
import QuerySite from 'components/data/query-sites';
import { ItemType } from './types';

export default function SiteItem( props: { item: ItemType; onRemove: ( e: MouseEvent ) => void } ) {
	const siteId = props.item.site_ID as number;
	const site = useSelector( ( state ) => getSite( state, siteId ) );

	if ( ! site ) {
		return (
			<>
				<QuerySite siteId={ siteId } />
				<SitePlaceholder />
			</>
		);
	} else if ( site.is_error ) {
		return (
			<>
				<div className="site-item__error">{ JSON.stringify( site, null, 2 ) }</div>
				<Button scary primary onClick={ props.onRemove }>
					Remove from list
				</Button>
			</>
		);
	}
	return (
		<>
			<Site site={ site } />
			<Button scary primary onClick={ props.onRemove }>
				Remove from list
			</Button>
		</>
	);
}
