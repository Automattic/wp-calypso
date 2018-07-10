/**
 * External dependencies
 */
import { find, get, includes, union } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { withInstanceId, Button } from '@wordpress/components';
import { compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import PostFormatCheck from './check';

const POST_FORMATS = [
	{ id: 'aside', caption: __( 'Aside' ) },
	{ id: 'gallery', caption: __( 'Gallery' ) },
	{ id: 'link', caption: __( 'Link' ) },
	{ id: 'image', caption: __( 'Image' ) },
	{ id: 'quote', caption: __( 'Quote' ) },
	{ id: 'standard', caption: __( 'Standard' ) },
	{ id: 'status', caption: __( 'Status' ) },
	{ id: 'video', caption: __( 'Video' ) },
	{ id: 'audio', caption: __( 'Audio' ) },
	{ id: 'chat', caption: __( 'Chat' ) },
];

function PostFormat( { onUpdatePostFormat, postFormat = 'standard', supportedFormats, suggestedFormat, instanceId } ) {
	const postFormatSelectorId = 'post-format-selector-' + instanceId;
	const formats = POST_FORMATS.filter( ( format ) => includes( supportedFormats, format.id ) );
	const suggestion = find( formats, ( format ) => format.id === suggestedFormat );

	// Disable reason: We need to change the value immiediately to show/hide the suggestion if needed

	/* eslint-disable jsx-a11y/no-onchange */
	return (
		<PostFormatCheck>
			<div className="editor-post-format">
				<div className="editor-post-format__content">
					<label htmlFor={ postFormatSelectorId }>{ __( 'Post Format' ) }</label>
					<select
						value={ postFormat }
						onChange={ ( event ) => onUpdatePostFormat( event.target.value ) }
						id={ postFormatSelectorId }
					>
						{ formats.map( ( format ) => (
							<option key={ format.id } value={ format.id }>{ format.caption }</option>
						) ) }
					</select>
				</div>

				{ suggestion && suggestion.id !== postFormat && (
					<div className="editor-post-format__suggestion">
						{ __( 'Suggestion:' ) }{ ' ' }
						<Button isLink onClick={ () => onUpdatePostFormat( suggestion.id ) }>
							{ suggestion.caption }
						</Button>
					</div>
				) }
			</div>
		</PostFormatCheck>
	);
	/* eslint-enable jsx-a11y/no-onchange */
}

export default compose( [
	withSelect( ( select ) => {
		const { getEditedPostAttribute, getSuggestedPostFormat } = select( 'core/editor' );
		const postFormat = getEditedPostAttribute( 'format' );
		const themeSupports = select( 'core' ).getThemeSupports();
		// Ensure current format is always in the set.
		// The current format may not be a format supported by the theme.
		const supportedFormats = union( [ postFormat ], get( themeSupports, [ 'formats' ], [] ) );
		return {
			postFormat,
			supportedFormats,
			suggestedFormat: getSuggestedPostFormat(),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		onUpdatePostFormat( postFormat ) {
			dispatch( 'core/editor' ).editPost( { format: postFormat } );
		},
	} ) ),
	withInstanceId,
] )( PostFormat );
