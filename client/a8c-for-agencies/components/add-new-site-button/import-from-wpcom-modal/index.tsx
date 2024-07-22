import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import useImportWPCOMSitesMutation from 'calypso/a8c-for-agencies/data/sites/use-import-wpcom-sites';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import WPCOMSitesTable from './wpcom-sites-table';

import './style.scss';

type Props = {
	onClose: () => void;
	onImport?: ( blogIds: number[] ) => void;
};

export default function ImportFromWPCOMModal( { onImport, onClose }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ selectedSites, setSelectedSites ] = useState< number[] | [] >( [] );

	const { mutate: importWPCOMSites, isPending } = useImportWPCOMSitesMutation();

	const [ isPendingImport, setIsPendingImport ] = useState( false );

	const handleAddSites = () => {
		if ( selectedSites.length ) {
			importWPCOMSites( selectedSites, {
				onSuccess: () => {
					setIsPendingImport( true );
					// Wait for a second before calling the onImport callback to give the site profiler to finish re-indexing.
					setTimeout( () => {
						onImport?.( selectedSites );
						onClose();
						setIsPendingImport( false );
						dispatch(
							successNotice(
								selectedSites.length === 1
									? translate( 'The site has been successfully added.' )
									: translate( '%(count)s sites have been successfully added.', {
											args: {
												count: selectedSites.length,
											},
											comment: '%(count)s is the number of sites added.',
									  } )
							)
						);
					}, 1000 );
				},
			} );
		}
	};

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
				<Button onClick={ onClose } disabled={ isPending || isPendingImport }>
					{ translate( 'Cancel' ) }
				</Button>

				<Button
					primary
					disabled={ selectedSites.length === 0 || isPending || isPendingImport }
					onClick={ handleAddSites }
					busy={ isPending || isPendingImport }
				>
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
