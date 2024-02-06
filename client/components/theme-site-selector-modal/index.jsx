import { createSitesListComponent } from '@automattic/sites';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import ThemeSiteSelectorTableRow from './theme-site-selector-table-row';

import './style.scss';

const ThemeSiteSelectorSitesList = createSitesListComponent( { grouping: false } );

export default function ThemeSiteSelectorModal( { isOpen, onClose, themeId } ) {
	const translate = useTranslate();
	const [ selected, setSelected ] = useState( '' );

	const allSites = useSelector( ( state ) => getSites( state, false ) );

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
			<div className="theme-site-selector-modal__content">
				{ !! allSites.length && (
					<ThemeSiteSelectorSitesList sites={ allSites }>
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
											onChange={ setSelected }
											selected={ selected }
											site={ site }
										/>
									) ) }
								</tbody>
							</table>
						) }
					</ThemeSiteSelectorSitesList>
				) }
			</div>
			<div className="theme-site-selector-modal__buttons">
				<Button disabled={ ! selected } isPrimary>
					{ translate( 'Activate this theme' ) }
				</Button>
			</div>
		</Modal>
	);
}
