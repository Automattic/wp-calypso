import page from '@automattic/calypso-router';
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
import {
	A4A_WOOPAYMENTS_SITE_SETUP_LINK,
	A4A_SITES_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AddWooPaymentsToSiteTable, { type WooPaymentsSiteItem } from './add-site-table';

import './style.scss';

const AddWooPaymentsToSiteModal = ( { onClose }: { onClose: () => void } ) => {
	const dispatch = useDispatch();

	const [ selectedSite, setSelectedSite ] = useState< WooPaymentsSiteItem | null >( null );

	const handleAddSite = () => {
		if ( selectedSite ) {
			dispatch( recordTracksEvent( 'calypso_a4a_woopayments_add_site_button_click' ) );
			page.redirect(
				addQueryArgs( A4A_WOOPAYMENTS_SITE_SETUP_LINK, {
					site_id: selectedSite?.rawSite.blog_id,
				} )
			);
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
										dispatch(
											recordTracksEvent(
												'calypso_a4a_woopayments_add_site_modal_sites_dashboard_click'
											)
										)
									}
								/>
							),
						}
					) }
				</Text>
				<AddWooPaymentsToSiteTable
					setSelectedSite={ setSelectedSite }
					selectedSite={ selectedSite }
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
};

export default AddWooPaymentsToSiteModal;
