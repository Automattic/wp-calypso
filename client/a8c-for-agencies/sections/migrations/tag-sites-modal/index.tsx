import { Button } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import { preventWidows } from 'calypso/lib/formatting';
import MigrationsAddSitesTable from './add-sites-table';

import './style.scss';

export default function MigrationsTagSitesModal( { onClose }: { onClose: () => void } ) {
	const translate = useTranslate();

	const handleAddSites = () => {
		// TODO: Implement this
	};

	const [ selectedSites, setSelectedSites ] = useState< number[] | [] >( [] );

	return (
		<A4AModal
			onClose={ onClose }
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
