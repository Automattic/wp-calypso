import { ClassNames } from '@emotion/react';
import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import Search from 'calypso/components/search';
import { SitesTable } from './sites-table';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export function SearchableSitesTable( { sites }: { className?: string; sites: SiteData[] } ) {
	const [ search, setSearch ] = useState( '' );

	const fuseInstance = useMemo( () => {
		return new Fuse( sites, {
			keys: [ 'URL', 'domain', 'name', 'slug' ],
			threshold: 0.4,
			distance: 20,
		} );
	}, [ sites ] );

	const filteredSites = useMemo( () => {
		if ( ! search ) {
			return fuseInstance.list;
		}

		const results = fuseInstance.search( search );

		return results;
	}, [ fuseInstance, search ] );

	return (
		<ClassNames>
			{ ( { css } ) => (
				<div
					className={ css`
						margin-top: 32px;
					` }
				>
					<Search onSearch={ setSearch } value={ search } />
					<SitesTable sites={ filteredSites } />
				</div>
			) }
		</ClassNames>
	);
}
