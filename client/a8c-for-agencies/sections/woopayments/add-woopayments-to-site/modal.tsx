import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import useAddWooPaymentsToSiteMutation from 'calypso/a8c-for-agencies/hooks/use-install-plugin-to-site';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import AddWooPaymentsToSiteTable, { type WooPaymentsSiteItem } from './add-site-table';

const AddWooPaymentsToSiteModal = ( { onClose }: { onClose: () => void } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ selectedSite, setSelectedSite ] = useState< WooPaymentsSiteItem | null >( null );

	const {
		mutate: addWooPaymentsToSite,
		status,
		error,
		isPending,
	} = useAddWooPaymentsToSiteMutation();

	useEffect( () => {
		if ( status === 'success' ) {
			onClose();
		} else if ( status === 'error' ) {
			dispatch(
				errorNotice( error.message ?? translate( 'Something went wrong. Please try again.' ) )
			);
		}
	}, [ status, onClose, error, dispatch, translate ] );

	const handleAddSite = () => {
		if ( selectedSite ) {
			addWooPaymentsToSite( {
				siteId: selectedSite.id,
				pluginSlug: 'woocommerce-payments',
			} );
		}
	};

	const excludedSites = null; // FIXME: Replace this with sites that already have WooPayments enabled

	return (
		<A4AModal
			title={ translate( 'Which site would you like to add WooPayments to?' ) }
			subtile={ translate(
				"If you don't see the site in the list, connect it first via the Sites Dashboard."
			) }
			onClose={ onClose }
			extraActions={
				<Button
					variant="primary"
					onClick={ handleAddSite }
					disabled={ isPending || ! selectedSite }
					isBusy={ isPending }
				>
					{ translate( 'Add WooPayments to selected site' ) }
				</Button>
			}
		>
			<AddWooPaymentsToSiteTable
				setSelectedSite={ setSelectedSite }
				selectedSite={ selectedSite }
				excludedSites={ excludedSites }
			/>
		</A4AModal>
	);
};

export default AddWooPaymentsToSiteModal;
