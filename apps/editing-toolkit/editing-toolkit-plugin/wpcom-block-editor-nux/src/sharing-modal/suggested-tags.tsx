import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import { Button, FormTokenField } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { store as noticesStore } from '@wordpress/notices';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import useAddTagsToPost from './use-add-tags-to-post';

type PostMeta = {
	reader_suggested_tags: string;
};

type CoreEditorPlaceholder = {
	getCurrentPost: ( ...args: unknown[] ) => {
		id: number;
		meta: PostMeta;
	};
};

type SuggestedTagsEventProps = {
	number_of_original_suggested_tags: number;
	number_of_selected_tags: number;
	number_of_suggested_tags_selected: number;
	number_of_added_tags: number;
};

type SuggestedTagsProps = {
	setShouldShowSuggestedTags: ( shouldShow: boolean ) => void;
};

function SuggestedTags( props: SuggestedTagsProps ) {
	const { __, _n } = useI18n();
	const localeSlug = useLocale();
	const { id: postId, meta: postMeta } = useSelect(
		( select ) => ( select( 'core/editor' ) as CoreEditorPlaceholder ).getCurrentPost(),
		[]
	);
	const { createNotice } = useDispatch( noticesStore );
	const origSuggestedTags = postMeta?.reader_suggested_tags
		? JSON.parse( postMeta.reader_suggested_tags )
		: [];
	const [ selectedTags, setSelectedTags ] = React.useState( origSuggestedTags );
	const onAddTagsButtonClick = ( numAddedTags: number ) => {
		// Compare origSuggestedTags and selectedTags and determine the number of tags that are different
		const numSuggestedTags = origSuggestedTags.length;
		const numSelectedTags = selectedTags.length;
		const numSameTags = origSuggestedTags.filter( ( tag: string ) =>
			selectedTags.includes( tag )
		).length;
		const eventProps: SuggestedTagsEventProps = {
			number_of_original_suggested_tags: numSuggestedTags,
			number_of_selected_tags: numSelectedTags,
			number_of_suggested_tags_selected: numSameTags,
			number_of_added_tags: numAddedTags,
		};
		recordTracksEvent( 'calypso_reader_post_publish_add_tags', eventProps );
		if ( numAddedTags > 0 ) {
			createNotice(
				'success',
				_n( 'Tag Added.', 'Tags Added.', numAddedTags, 'full-site-editing' ),
				{
					type: 'snackbar',
				}
			);
		} else {
			createNotice( 'warning', __( 'No Tags Added.', 'full-site-editing' ), {
				type: 'snackbar',
			} );
		}
		props.setShouldShowSuggestedTags( false );
	};
	const { saveTags } = useAddTagsToPost( postId, selectedTags, onAddTagsButtonClick );

	useEffect( () => {
		if ( origSuggestedTags?.length === 0 ) {
			// Check if localeSlug begins with 'en'
			if ( localeSlug && localeSlug.startsWith( 'en' ) ) {
				recordTracksEvent( 'calypso_reader_post_publish_no_suggested_tags' );
			}
			props.setShouldShowSuggestedTags( false );
		} else {
			recordTracksEvent( 'calypso_reader_post_publish_show_suggested_tags', {
				number_of_original_suggested_tags: origSuggestedTags.length,
			} );
		}
	}, [] );

	const onChangeSelectedTags = ( newTags: ( string | TokenItem )[] ) => {
		setSelectedTags( newTags );
		recordTracksEvent( 'calypso_reader_post_publish_update_suggested_tags' );
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
			<Button
				className="wpcom-block-editor-post-published-sharing-modal__save-tags"
				onClick={ saveTags }
				variant="primary"
			>
				{ __( 'Add these tags', 'full-site-editing' ) }
			</Button>
		</div>
	);
}

export default React.memo( SuggestedTags );
