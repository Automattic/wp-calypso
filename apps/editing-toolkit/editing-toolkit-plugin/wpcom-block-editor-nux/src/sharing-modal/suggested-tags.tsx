import { Button, FormTokenField } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';

type CoreEditorPlaceholder = {
	getCurrentPost: ( ...args: unknown[] ) => {
		meta: object;
	};
};

function SuggestedTags() {
	const { __ } = useI18n();
	const { meta: postMeta } = useSelect(
		( select ) => ( select( 'core/editor' ) as CoreEditorPlaceholder ).getCurrentPost(),
		[]
	);
	const [ selectedTags, setSelectedTags ] = React.useState(
		postMeta?.reader_suggested_tags ? JSON.parse( postMeta.reader_suggested_tags ) : false
	);
	if ( ! selectedTags ) {
		return null;
	}

	const tokenField = (
		<FormTokenField
			value={ selectedTags }
			onChange={ setSelectedTags }
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
			<Button
				className="wpcom-block-editor-post-published-sharing-modal__save-tags"
				onClick={ () => {
					console.log( 'click', selectedTags );
				} } //TODO: need to figure out how to save tags
				isPrimary={ true }
			>
				{ __( 'Add these tags', 'full-site-editing' ) }
			</Button>
		</div>
	);
}

export default React.memo( SuggestedTags );
