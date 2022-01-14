import { useEffect } from 'react';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import VideosUi from 'calypso/components/videos-ui';
import ModalFooterBar from 'calypso/components/videos-ui/modal-footer-bar';
import ModalHeaderBar from 'calypso/components/videos-ui/modal-header-bar';
import { COURSE_SLUGS } from 'calypso/data/courses';

import './style.scss';

const BloggingQuickStartModal = ( props ) => {
	const { isVisible = false, onClose = () => {} } = props;

	// Scroll to top on initial load regardless of previous page position
	useEffect( () => {
		if ( isVisible ) {
			window.scrollTo( 0, 0 );
		}
	}, [ isVisible ] );

	return (
		isVisible && (
			<BlankCanvas className={ 'blogging-quick-start-modal' }>
				<BlankCanvas.Content>
					<VideosUi
						courseSlug={ COURSE_SLUGS.BLOGGING_QUICK_START }
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

export default BloggingQuickStartModal;
