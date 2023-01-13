import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import BulkSelect from 'calypso/components/bulk-select';
import DashboardBulkActions from '../../dashboard-bulk-actions';
import SitesOverviewContext from '../context';
import type { SiteData } from '../types';

import './style.scss';

interface Props {
	sites: Array< SiteData >;
}

export default function SiteBulkSelect( { sites }: Props ) {
	const translate = useTranslate();

	const { selectedSites, setSelectedSites } = useContext( SitesOverviewContext );

	const handleToggleSelect = () => {
		const filteredSites = sites.filter( ( site ) => ! site.site.error );

		if ( selectedSites.length === filteredSites.length ) {
			setSelectedSites( [] );
		} else {
			setSelectedSites( filteredSites.map( ( site ) => site.site.value.blog_id ) );
		}
	};

	return (
		<div className="site-bulk-select">
			<div className="site-bulk-select__checkbox">
				<BulkSelect
					key="site-bulk-select"
					totalElements={ sites.length }
					selectedElements={ selectedSites.length }
					onToggle={ handleToggleSelect }
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
				selectedSites={ sites
					.map( ( item ) => item.site.value )
					.filter( ( site ) => selectedSites.includes( site.blog_id ) ) }
			/>
		</div>
	);
}
