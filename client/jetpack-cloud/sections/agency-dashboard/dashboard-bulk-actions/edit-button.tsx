import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import SitesOverviewContext from '../sites-overview/context';
import type { SiteData } from '../sites-overview/types';

import './style.scss';

interface Props {
	sites: Array< SiteData >;
}

export default function EditButton( { sites }: Props ) {
	const translate = useTranslate();

	const { setIsBulkManagementActive, setSelectedSites } = useContext( SitesOverviewContext );

	const handleToggleSelect = () => {
		// Filter sites with site error as they are not selectable.
		const filteredSite = sites.filter( ( site ) => ! site.site.error );
		setSelectedSites( filteredSite.map( ( item ) => item.site.value ) );
	};

	const handleEditAll = () => {
		setIsBulkManagementActive( true );
		handleToggleSelect();
	};

	return (
		<ButtonGroup>
			<Button className="dashboard-bulk-actions__edit-button" compact onClick={ handleEditAll }>
				{ translate( 'Edit All', { context: 'button label' } ) }
			</Button>
		</ButtonGroup>
	);
}
