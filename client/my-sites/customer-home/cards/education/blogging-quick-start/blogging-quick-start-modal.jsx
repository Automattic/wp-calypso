import { Gridicon } from '@automattic/components';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import VideosUi from 'calypso/components/videos-ui';

import './style.scss';

const BloggingQuickStartModal = ( props ) => {
	const { isVisible = false, onClose = () => {} } = props;

	const finishLink = (
		<span role="button" onKeyDown={ onClose } onClick={ onClose } tabIndex={ 0 }>
			<Gridicon icon="cross" size={ 18 } />
		</span>
	);

	return (
		isVisible && (
			<BlankCanvas className={ 'blogging-quick-start-modal' }>
				<BlankCanvas.Content>
					<VideosUi
						shouldDisplayTopLinks={ true }
						onBackClick={ onClose }
						finishLink={ finishLink }
					/>
				</BlankCanvas.Content>
			</BlankCanvas>
		)
	);
};

export default BloggingQuickStartModal;
