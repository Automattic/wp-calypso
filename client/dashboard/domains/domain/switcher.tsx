import item from '@automattic/components/src/suggestions/item';
import { useQuery } from '@tanstack/react-query';
import { MenuGroup, SearchControl, Icon } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { globe } from '@wordpress/icons';
import { useState } from 'react';
import { domainsQuery } from '../../app/queries/domains';
import RouterLinkMenuItem from '../../components/router-link-menu-item';
import type { View } from '@wordpress/dataviews';

// import './switcher.scss';

const fields = [
	{
		id: 'name',
		getValue: ( { item }: { item: any } ) => item.domain,
		enableGlobalSearch: true,
	},
];

const DEFAULT_VIEW: View = {
	type: 'list',
	page: 1,
	perPage: 10,
	sort: { field: 'name', direction: 'asc' },
};

export default function Switcher( { onClose }: { onClose: () => void } ) {
	const domains = useQuery( domainsQuery() ).data;
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	if ( ! domains ) {
		return __( 'Loading…' );
	}

	const { data: filteredData } = filterSortAndPaginate( domains, view, fields );

	return (
		<div style={ { width: '280px' } }>
			<MenuGroup>
				<SearchControl
					label={ __( 'Search' ) }
					value={ view.search }
					onChange={ ( value ) => setView( { ...view, search: value } ) }
					size="compact"
					__nextHasNoMarginBottom
				/>
			</MenuGroup>
			<MenuGroup>
				{ filteredData.map( ( domain ) => (
					<RouterLinkMenuItem
						key={ domain.domain }
						to={ `/domains/${ domain.domain }/` }
						onClick={ onClose }
					>
						<div style={ { display: 'flex', gap: '8px', alignItems: 'center', width: '100%' } }>
							<Icon icon={ globe } size={ 24 } />
							<span
								style={ { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
							>
								{ fields[ 0 ].getValue( { item: domain } ) }
							</span>
						</div>
					</RouterLinkMenuItem>
				) ) }
			</MenuGroup>
		</div>
	);
}
