import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import BulkSelect from 'calypso/components/bulk-select';
import DashboardBulkActions from '../../dashboard-bulk-actions';
import SitesOverviewContext from '../context';
import type { SiteData } from '../types';

import './style.scss';

interface Props {
	sites: Array< SiteData >;
	isLoading: boolean;
}

export default function SiteBulkSelect( { sites, isLoading }: Props ) {
	const translate = useTranslate();

	const { selectedSites, setSelectedSites } = useContext( SitesOverviewContext );

	const selectedSiteIds = selectedSites.map( ( site ) => site.blog_id );

	const isAllChecked = ( sites: Array< SiteData > ) => {
		return (
			selectedSites.length > 0 &&
			sites
				.map( ( site ) => site.site.value.blog_id )
				.every( ( item ) => selectedSiteIds.includes( item ) )
		);
	};

	const handleToggleSelect = () => {
		// Filter sites with site error as they are not selectable.
		const filteredSites = sites.filter( ( site ) => ! site.site.error );
		const isChecked = isAllChecked( filteredSites );

		if ( isChecked ) {
			setSelectedSites(
				selectedSites.filter(
					( selectedSite ) =>
						! filteredSites.find( ( site ) => site.site.value.blog_id === selectedSite.blog_id )
				)
			);
		} else {
			setSelectedSites(
				[ ...selectedSites, ...filteredSites.map( ( site ) => site.site.value ) ].filter(
					( element, index, array ) =>
						array.map( ( selectedSite ) => selectedSite.blog_id ).indexOf( element.blog_id ) ===
						index
				)
			);
		}
	};

	const isChecked = isAllChecked( sites );

	const isHalfChecked =
		! isChecked &&
		selectedSites.length > 0 &&
		sites
			.map( ( site ) => site.site.value.blog_id )
			.some( ( item ) => selectedSiteIds.includes( item ) );

	return (
		<div className="site-bulk-select">
			<div className="site-bulk-select__checkbox">
				<BulkSelect
					key="site-bulk-select"
					totalElements={ sites.length }
					selectedElements={ selectedSites.length }
					onToggle={ handleToggleSelect }
					isChecked={ isChecked }
					isHalfChecked={ isHalfChecked }
					disabled={ isLoading }
				/>

				<div className="site-bulk-select__bulk-select-label">
					{ translate( '%(number)d {{span}}Selected{{/span}}', {
						args: {
							number: selectedSites.length,
						},
						components: {
							span: <span />,
						},
					} ) }
				</div>
			</div>
			<DashboardBulkActions selectedSites={ selectedSites } />
		</div>
	);
}
