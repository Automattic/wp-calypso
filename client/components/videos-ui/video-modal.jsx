import { useEffect } from 'react';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import VideosUi from 'calypso/components/videos-ui/index';
import ModalFooterBar from 'calypso/components/videos-ui/modal-footer-bar';
import ModalHeaderBar from 'calypso/components/videos-ui/modal-header-bar';

const VideoModal = ( props ) => {
	const { isVisible = false, onClose = () => {}, courseSlug = false } = props;

	// Scroll to top on initial load regardless of previous page position
	useEffect( () => {
		if ( isVisible ) {
			window.scrollTo( 0, 0 );
		}
	}, [ isVisible ] );

	return (
		isVisible && (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<BlankCanvas className="video-modal">
				<BlankCanvas.Content>
					<VideosUi
						courseSlug={ courseSlug }
						HeaderBar={ ( headerProps ) => (
							<ModalHeaderBar onClose={ onClose } { ...headerProps } />
						) }
						FooterBar={ ( footerProps ) => (
							<ModalFooterBar onBackClick={ onClose } { ...footerProps } />
						) }
						areVideosTranslated={ false }
					/>
				</BlankCanvas.Content>
			</BlankCanvas>
		)
	);
};

export default VideoModal;
