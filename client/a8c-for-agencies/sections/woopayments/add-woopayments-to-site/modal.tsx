import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import AddWooPaymentsToSiteTable, { type WooPaymentsSiteItem } from './add-site-table';

const AddWooPaymentsToSiteModal = ( { onClose }: { onClose: () => void } ) => {
	const translate = useTranslate();

	const [ selectedSite, setSelectedSite ] = useState< WooPaymentsSiteItem | null >( null );

	const isPending = false;

	const handleAddSite = () => {
		// TODO: Add the site
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
