import { ClassNames } from '@emotion/react';
import { useState } from 'react';
import Search from 'calypso/components/search';
import { SitesTable } from './sites-table';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export function SearchableSitesTable( { sites }: { className?: string; sites: SiteData[] } ) {
	const [ search, setSearch ] = useState( '' );

	return (
		<ClassNames>
			{ ( { css } ) => (
				<div
					className={ css`
						margin-top: 32px;
					` }
				>
					<Search onSearch={ setSearch } value={ search } />
					<SitesTable sites={ sites } />
				</div>
			) }
		</ClassNames>
	);
}
