import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { Text } from '../../../../components/text';
import AddWooPaymentsToSiteTable from './add-site-table';
import type { RecordTracksEvent } from '../types';
import type { AgencySite } from '@automattic/api-core';

// Inlined from client/a8c-for-agencies so the dashboard has no dependency on the classic A4A app.
// Both destinations are classic A4A routes (not part of the dashboard's TanStack Router), so
// navigating to them is a full page navigation rather than a client-side route change.
// TODO: point at a dashboard-native WooPayments site-setup flow once one exists.
const A4A_WOOPAYMENTS_SITE_SETUP_LINK = '/woopayments/site-setup';
const A4A_SITES_LINK = '/sites';

export default function AddWooPaymentsToSiteModal( {
	onClose,
	recordTracksEvent = () => {},
}: {
	onClose: () => void;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	const [ selectedSite, setSelectedSite ] = useState< AgencySite | null >( null );

	const handleAddSite = () => {
		if ( ! selectedSite ) {
			return;
		}
		recordTracksEvent( 'calypso_a4a_woopayments_add_site_button_click' );
		window.location.assign(
			addQueryArgs( A4A_WOOPAYMENTS_SITE_SETUP_LINK, { site_id: selectedSite.blog_id } )
		);
	};

	return (
		<Modal
			title={ __( 'Which site would you like to add WooPayments to?' ) }
			onRequestClose={ onClose }
			size="medium"
		>
			<VStack spacing={ 4 }>
				<Text>
					{ createInterpolateElement(
						__(
							'If you don’t see the site in the list, connect it first via the <link>Sites Dashboard</link>.'
						),
						{
							link: (
								<Button
									variant="link"
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
					selectedSite={ selectedSite }
					onSelectSite={ setSelectedSite }
					recordTracksEvent={ recordTracksEvent }
				/>
				<HStack justify="flex-end">
					<Button variant="secondary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary" onClick={ handleAddSite } disabled={ ! selectedSite }>
						{ __( 'Add WooPayments to selected site' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
