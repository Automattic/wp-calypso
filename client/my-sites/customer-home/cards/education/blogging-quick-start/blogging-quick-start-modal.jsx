import { BlankCanvas } from 'calypso/components/blank-canvas';
import VideosUi from 'calypso/components/videos-ui';

import './style.scss';

const BloggingQuickStartModal = ( props ) => {
	const { isVisible = false, onClose = () => {} } = props;

	return (
		isVisible && (
			<BlankCanvas className={ 'blogging-quick-start-modal' }>
				<BlankCanvas.Content>
					<VideosUi onBackClick={ onClose } />
				</BlankCanvas.Content>
			</BlankCanvas>
		)
	);
};

export default BloggingQuickStartModal;
