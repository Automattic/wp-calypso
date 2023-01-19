import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import BulkSelect from 'calypso/components/bulk-select';
import DashboardBulkActions from '../../dashboard-bulk-actions';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../hooks';
import SitesOverviewContext from '../context';
import type { SiteData } from '../types';

import './style.scss';

interface Props {
	sites: Array< SiteData >;
	isLoading: boolean;
	isLargeScreen?: boolean;
}

export default function SiteBulkSelect( { sites, isLoading, isLargeScreen }: Props ) {
	const translate = useTranslate();
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( null, isLargeScreen );

	const { selectedSites, setSelectedSites } = useContext( SitesOverviewContext );

	const selectedSiteIds = selectedSites.map( ( site ) => site.blog_id );

	const isAllChecked = ( sites: Array< SiteData > ) => {
		return (
			selectedSites.length > 0 &&
			sites.every( ( item ) => selectedSiteIds.includes( item.site.value.blog_id ) )
		);
	};

	const handleToggleSelect = () => {
		// Filter sites with site error as they are not selectable.
		const filteredSites = sites.filter( ( { site: { error } } ) => ! error );
		const isChecked = isAllChecked( filteredSites );

		const allSelectedSites = isChecked
			? selectedSites.filter(
					( { blog_id } ) =>
						! filteredSites.find( ( { site: { value } } ) => value.blog_id === blog_id )
			  )
			: [ ...selectedSites, ...filteredSites.map( ( { site: { value } } ) => value ) ].filter(
					( element, index, array ) =>
						array.map( ( { blog_id } ) => blog_id ).indexOf( element.blog_id ) === index
			  );
		setSelectedSites( allSelectedSites );
		recordEvent( isChecked ? 'site_bulk_unselect_all' : 'site_bulk_select_all', {
			...( allSelectedSites.length && { selected_site_count: allSelectedSites.length } ),
		} );
	};

	const isChecked = isAllChecked( sites );

	const isHalfChecked =
		! isChecked &&
		selectedSites.length > 0 &&
		sites.some( ( item ) => selectedSiteIds.includes( item.site.value.blog_id ) );

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
			<DashboardBulkActions
				selectedSites={ selectedSites }
				monitorUserEmails={ sites[ 0 ].monitor.settings?.monitor_user_emails ?? [] }
				isLargeScreen={ isLargeScreen }
			/>
		</div>
	);
}
