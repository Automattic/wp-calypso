import { filterSortAndPaginate } from '@automattic/dataviews';
import { useQuery } from '@tanstack/react-query';
import { MenuGroup, MenuItem, SearchControl, Icon, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useState } from 'react';
import { sitesQuery } from '../../app/queries';
import RouterLinkMenuItem from '../../components/router-link-menu-item';
import AddNewSite from '../add-new-site';
import SiteIcon from '../site-icon';
import type { View } from '@automattic/dataviews';

import './switcher.scss';

const fields = [ { id: 'name', enableGlobalSearch: true } ];

const DEFAULT_VIEW: View = {
	type: 'list',
	page: 1,
	perPage: 10,
	sort: { field: 'name', direction: 'asc' },
};

export default function Switcher( { onClose }: { onClose: () => void } ) {
	const sites = useQuery( sitesQuery() ).data;
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

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
					<RouterLinkMenuItem key={ site.ID } to={ `/sites/${ site.slug }` } onClick={ onClose }>
						<div style={ { display: 'flex', gap: '8px', alignItems: 'center', width: '100%' } }>
							<SiteIcon site={ site } size={ 24 } />
							<span
								style={ { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
							>
								{ site.name }
							</span>
						</div>
					</RouterLinkMenuItem>
				) ) }
			</MenuGroup>
			<MenuGroup>
				<MenuItem onClick={ () => setIsModalOpen( true ) }>
					<div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
						<Icon icon={ plus } />
						{ __( 'Add New Site' ) }
					</div>
				</MenuItem>
			</MenuGroup>
			{ isModalOpen && (
				<Modal
					title={ __( 'Add New Site' ) }
					onRequestClose={ () => setIsModalOpen( false ) }
					className="dashboard-site-switcher__modal"
				>
					<AddNewSite context="sites-dashboard" />
				</Modal>
			) }
		</div>
	);
}
