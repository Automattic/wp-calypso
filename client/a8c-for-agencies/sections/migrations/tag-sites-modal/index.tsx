import { Button } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import MigrationsAddSitesTable from './add-sites-table';

import './style.scss';

export default function MigrationsTagSitesModal( { onClose }: { onClose: () => void } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ selectedSites, setSelectedSites ] = useState< number[] | [] >( [] );

	const handleAddSites = () => {
		// TODO: Implement this
		dispatch(
			recordTracksEvent( 'calypso_a8c_migrations_tag_sites_modal_add_sites_click', {
				count: selectedSites.length,
			} )
		);
	};

	const handleOnClose = () => {
		onClose();
		dispatch( recordTracksEvent( 'calypso_a8c_migrations_tag_sites_modal_close' ) );
	};

	return (
		<A4AModal
			onClose={ handleOnClose }
			extraActions={
				<Button variant="primary" onClick={ handleAddSites }>
					{ selectedSites.length > 0
						? translate( 'Add %(count)d site', 'Add %(count)d sites', {
								args: {
									count: selectedSites.length,
								},
								count: selectedSites.length,
								comment: '%(count)s is the number of sites selected.',
						  } )
						: translate( 'Add sites' ) }
				</Button>
			}
			title={ translate( 'Tag your transferred sites for commission.' ) }
			subtile={ translate(
				"Select the sites you moved on your own. We'll check the migration and tag them as ready for your commission."
			) }
		>
			<div className="migrations-tag-sites-modal__instruction">
				<Icon size={ 18 } icon={ info } />
				{ preventWidows(
					translate(
						"Can't find your transferred site? Ensure the Automattic for Agencies plugin is connected in WP-Admin to display the site here."
					)
				) }
			</div>
			<MigrationsAddSitesTable
				selectedSites={ selectedSites }
				setSelectedSites={ setSelectedSites }
			/>
		</A4AModal>
	);
}
