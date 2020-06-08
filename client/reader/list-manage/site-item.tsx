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
import QuerySites from 'components/data/query-sites';
import { ItemType } from './types';

export default function SiteItem( props: { item: ItemType } ) {
	const siteId = props.item.site_ID as number;
	const site = useSelector( ( state ) => getSite( state, siteId ) );

	return ! site ? (
		<>
			<QuerySites siteId={ siteId } />
			<SitePlaceholder />
		</>
	) : (
		<>
			<Site site={ site } />
			<Button scary primary>
				Remove from list
			</Button>
		</>
	);
}
