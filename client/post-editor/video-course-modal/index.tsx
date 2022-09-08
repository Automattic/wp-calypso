import { useEffect } from 'react';
import * as React from 'react';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import VideosUi from 'calypso/components/videos-ui';
import ModalFooterBar from 'calypso/components/videos-ui/modal-footer-bar';
import ModalHeaderBar from 'calypso/components/videos-ui/modal-header-bar';
import { COURSE_SLUGS } from 'calypso/data/courses';

const VideoCourseModal: React.FunctionComponent< Props > = ( props ) => {
	const { isVisible, onClose, courseSlug } = props;

	useEffect( () => {
		if ( isVisible ) {
			window.scrollTo( 0, 0 );
		}
	}, [ isVisible ] );

	return (
		isVisible && (
			<BlankCanvas className="videos-ui__modal">
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

interface Props {
	onClose: () => void;
	isVisible: boolean;
	courseSlug: string;
}

VideoCourseModal.defaultProps = {
	isVisible: false,
	onClose: () => {
		return;
	},
	courseSlug: COURSE_SLUGS.PAYMENTS_FEATURES,
};

export default VideoCourseModal;
