import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import AddWooPaymentsToSiteTable, { type WooPaymentsSiteItem } from './add-site-table';

// Adding WooPayments to a site links out to the classic A4A site-setup flow, which is not part of
// the dashboard.
const A4A_WOOPAYMENTS_SITE_SETUP_LINK = '/woopayments/site-setup';
const A4A_SITES_LINK = '/sites';

interface AddWooPaymentsToSiteModalProps {
	excludedSiteIds: number[];
	onClose: () => void;
}

export default function AddWooPaymentsToSiteModal( {
	excludedSiteIds,
	onClose,
}: AddWooPaymentsToSiteModalProps ) {
	const { recordTracksEvent } = useAnalytics();
	const [ selectedSite, setSelectedSite ] = useState< WooPaymentsSiteItem | null >( null );

	const handleAddSite = () => {
		if ( selectedSite ) {
			recordTracksEvent( 'calypso_a4a_woopayments_add_site_button_click' );
			window.location.href = addQueryArgs( A4A_WOOPAYMENTS_SITE_SETUP_LINK, {
				site_id: selectedSite.rawSite.blog_id,
			} );
		}
	};

	return (
		<Modal
			title={ __( 'Which site would you like to add WooPayments to?' ) }
			onRequestClose={ onClose }
			size="large"
		>
			<VStack spacing={ 6 }>
				<Text>
					{ createInterpolateElement(
						__(
							"If you don't see the site in the list, connect it first via the <a>Sites Dashboard</a>."
						),
						{
							a: (
								<a
									href={ A4A_SITES_LINK }
									onClick={ () =>
										recordTracksEvent(
											'calypso_a4a_woopayments_add_site_modal_sites_dashboard_click'
										)
									}
								/>
							),
						}
					) }
				</Text>
				<AddWooPaymentsToSiteTable
					excludedSiteIds={ excludedSiteIds }
					selectedSite={ selectedSite }
					setSelectedSite={ setSelectedSite }
				/>
				<HStack justify="flex-end" spacing={ 3 }>
					<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						onClick={ handleAddSite }
						disabled={ ! selectedSite }
					>
						{ __( 'Add WooPayments to selected site' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
