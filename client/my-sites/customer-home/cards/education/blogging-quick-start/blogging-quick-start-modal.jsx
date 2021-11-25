import { BlankCanvas } from 'calypso/components/blank-canvas';
import VideosUi from 'calypso/components/videos-ui';
import ModalFooterBar from 'calypso/components/videos-ui/modal-footer-bar';
import ModalHeaderBar from 'calypso/components/videos-ui/modal-header-bar';

import './style.scss';

const BloggingQuickStartModal = ( props ) => {
	const { isVisible = false, onClose = () => {} } = props;

	return (
		isVisible && (
			<BlankCanvas className={ 'blogging-quick-start-modal' }>
				<BlankCanvas.Content>
					<VideosUi
						headerBar={ <ModalHeaderBar onClose={ onClose } /> }
						footerBar={ <ModalFooterBar onBackClick={ onClose } /> }
					/>
				</BlankCanvas.Content>
			</BlankCanvas>
		)
	);
};

export default BloggingQuickStartModal;
