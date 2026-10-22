import { Link } from '@tanstack/react-router';
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
	/**
	 * Set to false in apps without the dashboard's TanStack Router, so the
	 * Sites link renders a plain anchor for the host app's own router.
	 */
	shouldUseRouterLink?: boolean;
}

export default function AddWooPaymentsToSiteModal( {
	agencyId,
	excludedSiteIds,
	recordTracksEvent,
	onSelectSite,
	onClose,
	shouldUseRouterLink = false,
}: AddWooPaymentsToSiteModalProps ) {
	const [ selectedSite, setSelectedSite ] = useState< WooPaymentsSiteItem | null >( null );

	const onSitesDashboardClick = () =>
		recordTracksEvent( 'calypso_a4a_woopayments_add_site_modal_sites_dashboard_click' );

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
							a: shouldUseRouterLink ? (
								<Link to={ A4A_SITES_LINK } onClick={ onSitesDashboardClick } />
							) : (
								<a href={ A4A_SITES_LINK } onClick={ onSitesDashboardClick } />
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
