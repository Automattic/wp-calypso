import { Modal, Button, Flex, FlexItem } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import draftPostImage from './images/draft-post.svg';
import './style.scss';

const DraftPostModal = () => {
	const { __ } = useI18n();

	return (
		<Modal open className="wpcom-block-editor-draft-post-modal">
			<img src={ draftPostImage } alt={ __( 'Draft post', 'full-site-editing' ) } />
			<h1 className="wpcom-block-editor-draft-post-modal__title">
				{ __( 'Draft your first post', 'full-site-editing' ) }
			</h1>
			<p className="wpcom-block-editor-draft-post-modal__description">
				{ __(
					'It’s time to flex those writing muscles and start drafting your first post!',
					'full-site-editing'
				) }
			</p>
			<Flex className="wpcom-block-editor-draft-post-modal__buttons" justify="center" gap={ 4 }>
				<FlexItem>
					<Button variant="primary" type="submit">
						{ __( 'Start writing', 'full-site-editing' ) }
					</Button>
				</FlexItem>
				<FlexItem>
					<Button variant="secondary">{ __( "I'm not ready", 'full-site-editing' ) }</Button>
				</FlexItem>
			</Flex>
		</Modal>
	);
};

export default DraftPostModal;
