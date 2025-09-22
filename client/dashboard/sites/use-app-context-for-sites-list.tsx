import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAppContext } from '../app/context';
import AddNewSite from './add-new-site';

interface AppContextForSitesListReturn {
	/**
	 * Props to pass to the button component
	 */
	newSiteButtonProps: {
		onClick?: () => void;
		href?: string;
	};
	/**
	 * The text to display on the button
	 */
	newSiteButtonText: string;
	/**
	 * The modal component to render (null if not needed)
	 */
	newSiteModalComponent: React.ReactNode | null;
	/**
	 * The page title to display in the PageHeader
	 */
	pageTitle: string;
	/**
	 * Whether the modal is currently open
	 */
	isModalOpen: boolean;
	/**
	 * Function to close the modal (only relevant when modal is used)
	 */
	closeModal: () => void;
}

/**
 * Hook that provides context-aware behavior for the sites list page.
 *
 * In WP.com context: Shows "Sites" title, "Add new site" button that opens modal
 * In CIAB context: Shows "Stores" title, "Add new store" button that navigates to URL
 * @param source - The context string to pass to AddNewSite component
 * @returns Object with page title, button props, button text, modal component, and modal state
 */
export function useAppContextForSitesList(
	source: string = 'sites-dashboard'
): AppContextForSitesListReturn {
	const { name: appContextName } = useAppContext();
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const openModal = () => setIsModalOpen( true );
	const closeModal = () => setIsModalOpen( false );

	if ( appContextName === 'CIAB' ) {
		return {
			newSiteButtonProps: {
				href: `/start?source=${ source }`,
			},
			newSiteButtonText: __( 'Add new store' ),
			newSiteModalComponent: null,
			pageTitle: __( 'Stores' ),
			isModalOpen: false,
			closeModal,
		};
	}

	return {
		newSiteButtonProps: {
			onClick: openModal,
		},
		newSiteButtonText: __( 'Add new site' ),
		newSiteModalComponent: isModalOpen ? (
			<Modal title={ __( 'Add new site' ) } onRequestClose={ closeModal }>
				<AddNewSite context={ source } />
			</Modal>
		) : null,
		pageTitle: __( 'Sites' ),
		isModalOpen,
		closeModal,
	};
}
