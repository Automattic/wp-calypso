import { createSitesListComponent, useSitesListSorting } from '@automattic/sites';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import { useSelector } from 'calypso/state';
import getVisibleSites from 'calypso/state/selectors/get-visible-sites';
import ThemeSiteSelectorActions from './theme-site-selector-actions';
import ThemeSiteSelectorTableRow from './theme-site-selector-table-row';

import './style.scss';

const ThemeSiteSelectorSitesList = createSitesListComponent( { grouping: false } );

export default function ThemeSiteSelectorModal( { isOpen, onClose, themeId } ) {
	const translate = useTranslate();
	const [ selectedSiteId, setSelectedSiteId ] = useState( null );

	const visibleSites = useSelector( ( state ) => getVisibleSites( state, false ) );
	const sortedVisibleSites = useSitesListSorting( visibleSites, {
		sortKey: 'lastInteractedWith',
		sortOrder: 'desc',
	} );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			className="theme-site-selector-modal"
			onRequestClose={ onClose }
			size="large"
			title={ translate( 'Select a site to activate %(themeName)s', {
				args: { themeName: themeId },
			} ) }
		>
			<QuerySiteFeatures siteIds={ [ selectedSiteId ] } />
			<div className="theme-site-selector-modal__content">
				{ !! visibleSites.length && (
					<ThemeSiteSelectorSitesList sites={ sortedVisibleSites }>
						{ ( { sites } ) => (
							<table>
								<thead>
									<tr>
										<th></th>
										<th>{ translate( 'Site' ) }</th>
										<th>{ translate( 'Plan' ) }</th>
										<th>{ translate( 'Last updated' ) }</th>
									</tr>
								</thead>
								<tbody>
									{ sites?.slice( 0, 10 )?.map( ( site ) => (
										<ThemeSiteSelectorTableRow
											key={ site.ID }
											onChange={ setSelectedSiteId }
											selected={ selectedSiteId }
											site={ site }
										/>
									) ) }
								</tbody>
							</table>
						) }
					</ThemeSiteSelectorSitesList>
				) }
			</div>
			<ThemeSiteSelectorActions siteId={ selectedSiteId } themeId={ themeId } />
		</Modal>
	);
}
