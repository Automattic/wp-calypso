import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { Modal } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import SitePreviewLink from 'calypso/components/site-preview-link';

interface SitePreviewModalProps {
	siteUrl: string;
	siteId: number;
	isVisible: boolean;
	closeModal: () => void;
}

const ModalContent = styled.div( {
	width: '80vw',
	maxWidth: '480px',
	minHeight: '100px',
	display: 'flex',
	flexDirection: 'column',
} );

const modalOverlayClassName = css( {
	// global-notices has z-index: 179
	zIndex: 178,
} );

const SitePreviewModal = ( { siteUrl, siteId, isVisible, closeModal }: SitePreviewModalProps ) => {
	const { __ } = useI18n();

	if ( ! isVisible ) {
		return null;
	}

	return (
		<Modal
			title={ __( 'Share site for preview' ) }
			onRequestClose={ closeModal }
			overlayClassName={ modalOverlayClassName }
		>
			<ModalContent>
				<SitePreviewLink siteUrl={ siteUrl } siteId={ siteId } source="smp-modal" />
			</ModalContent>
		</Modal>
	);
};

export default SitePreviewModal;
