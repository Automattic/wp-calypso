import { filterSortAndPaginate } from '@automattic/dataviews';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { MenuGroup, MenuItem, SearchControl, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useState } from 'react';
import { sitesQuery } from '../../app/queries';
import SiteIcon from '../site-icon';
import type { View } from '@automattic/dataviews';

const fields = [ { id: 'name', enableGlobalSearch: true } ];

const DEFAULT_VIEW: View = {
	type: 'list',
	page: 1,
	perPage: 10,
	sort: { field: 'name', direction: 'asc' },
};

export default function Switcher( { onClose }: { onClose: () => void } ) {
	const navigate = useNavigate();
	const sites = useQuery( sitesQuery() ).data;
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	if ( ! sites ) {
		return __( 'Loading…' );
	}

	const { data: filteredData } = filterSortAndPaginate( sites, view, fields );

	return (
		<div style={ { width: '280px' } }>
			<MenuGroup>
				<SearchControl
					label={ __( 'Search' ) }
					value={ view.search }
					onChange={ ( value ) => setView( { ...view, search: value } ) }
					__nextHasNoMarginBottom
				/>
			</MenuGroup>
			<MenuGroup>
				{ filteredData.map( ( site ) => (
					<MenuItem
						key={ site.ID }
						onClick={ async () => {
							await navigate( { to: `/sites/${ site.slug }` } );
							onClose();
						} }
					>
						<div style={ { display: 'flex', gap: '8px', alignItems: 'center', width: '100%' } }>
							<SiteIcon site={ site } size={ 24 } />
							<span
								style={ { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
							>
								{ site.name }
							</span>
						</div>
					</MenuItem>
				) ) }
			</MenuGroup>
			<MenuGroup>
				<MenuItem>
					<div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
						<Icon icon={ plus } />
						{ __( 'Add New Site' ) }
					</div>
				</MenuItem>
			</MenuGroup>
		</div>
	);
}
