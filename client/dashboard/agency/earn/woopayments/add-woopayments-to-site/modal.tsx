import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import AddWooPaymentsToSiteTable, { type WooPaymentsSiteItem } from './add-site-table';
import type { RecordTracksEvent } from '../types';

import './style.scss';

const A4A_SITES_LINK = '/sites';

interface AddWooPaymentsToSiteModalProps {
	agencyId: number;
	excludedSiteIds: number[];
	recordTracksEvent: RecordTracksEvent;
	onSelectSite: ( siteId: number ) => void;
	onClose: () => void;
}

export default function AddWooPaymentsToSiteModal( {
	agencyId,
	excludedSiteIds,
	recordTracksEvent,
	onSelectSite,
	onClose,
}: AddWooPaymentsToSiteModalProps ) {
	const [ selectedSite, setSelectedSite ] = useState< WooPaymentsSiteItem | null >( null );

	const handleAddSite = () => {
		if ( selectedSite ) {
			recordTracksEvent( 'calypso_a4a_woopayments_add_site_confirm_click' );
			onSelectSite( selectedSite.rawSite.blog_id );
		}
	};

	return (
		<Modal
			className="woopayments-add-site-modal"
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
					agencyId={ agencyId }
					excludedSiteIds={ excludedSiteIds }
					selectedSite={ selectedSite }
					setSelectedSite={ setSelectedSite }
					recordTracksEvent={ recordTracksEvent }
				/>
			</VStack>
			<HStack className="woopayments-add-site-modal__footer" justify="flex-end" spacing={ 3 }>
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
		</Modal>
	);
}
