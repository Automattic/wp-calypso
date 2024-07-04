import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import WPCOMSitesTable from './wpcom-sites-table';

import './style.scss';

export default function ImportFromWPCOMModal( { onClose }: { onClose: () => void } ) {
	const translate = useTranslate();

	const [ selectedSites, setSelectedSites ] = useState< number[] | [] >( [] );

	return (
		<Modal onRequestClose={ onClose } className="import-from-wpcom-modal" __experimentalHideHeader>
			<div className="import-from-wpcom-modal__main">
				<Button
					className="import-from-wpcom-modal__close-button"
					plain
					onClick={ onClose }
					aria-label={ translate( 'Close' ) }
				>
					<Icon size={ 24 } icon={ close } />
				</Button>

				<h1 className="import-from-wpcom-modal__title">
					{ translate( 'Add sites via WordPress.com connection' ) }
				</h1>

				<p className="import-from-wpcom-modal__instruction">
					{ translate(
						'Add one or more sites you previously created on WordPress.com or connected with Jetpack.'
					) }
				</p>
				<WPCOMSitesTable setSelectedSites={ setSelectedSites } selectedSites={ selectedSites } />
			</div>
			<div className="import-from-wpcom-modal__footer">
				<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>

				<Button primary disabled={ selectedSites.length === 0 }>
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
			</div>
		</Modal>
	);
}
