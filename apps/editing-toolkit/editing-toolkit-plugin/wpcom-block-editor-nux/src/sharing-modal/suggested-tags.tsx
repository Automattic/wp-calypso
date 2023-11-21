import { Button, FormTokenField } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import useAddTagsToPost from './use-add-tags-to-post';

type CoreEditorPlaceholder = {
	getCurrentPost: ( ...args: unknown[] ) => {
		id: number;
		meta: object;
	};
};

function SuggestedTags() {
	const { __ } = useI18n();
	const { id: postId, meta: postMeta } = useSelect(
		( select ) => ( select( 'core/editor' ) as CoreEditorPlaceholder ).getCurrentPost(),
		[]
	);
	const [ selectedTags, setSelectedTags ] = React.useState(
		postMeta?.reader_suggested_tags ? JSON.parse( postMeta.reader_suggested_tags ) : false
	);
	const { tagsAddedToPost, setTagsAddedToPost, saveTags } = useAddTagsToPost(
		postId,
		selectedTags
	);
	if ( ! selectedTags ) {
		return null;
	}

	const onChangeSelectedTags = ( newTags: string[] ) => {
		setSelectedTags( newTags );
		setTagsAddedToPost( false );
	};

	const tokenField = (
		<FormTokenField
			value={ selectedTags }
			onChange={ onChangeSelectedTags }
			label={ __( 'Tags', 'full-site-editing' ) }
		/>
	);

	return (
		<div className="wpcom-block-editor-post-published-sharing-modal__suggest-tags">
			<h1>{ __( 'Recommended tags:', 'full-site-editing' ) }</h1>
			<p>
				{ __(
					'Based on the topics and themes in your post, here are some suggested tags to consider:',
					'full-site-editing'
				) }
			</p>
			{ tokenField }
			<p>{ __( 'Adding tags can help drive more traffic to your post.', 'full-site-editing' ) }</p>
			<div className="wpcom-block-editor-post-published-sharing-modal__save-tags">
				<Button onClick={ saveTags } isPrimary={ true }>
					{ __( 'Add these tags', 'full-site-editing' ) }
				</Button>
				{ tagsAddedToPost && (
					<p className="wpcom-block-editor-post-published-sharing-modal__save-tags-status">
						{ __( 'Tags Added', 'full-site-editing' ) }
					</p>
				) }
			</div>
		</div>
	);
}

export default React.memo( SuggestedTags );
