/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';

/**
 * Custom hook for managing pattern metadata
 */
export function usePatternMetadata() {
	const { editEntityRecord } = useDispatch( 'core' );
	const { editPost } = useDispatch( 'core/editor' );

	// Get current post data
	const { postId, postType } = useSelect( ( select ) => {
		const { getCurrentPostId, getCurrentPostType } = select( 'core/editor' );
		return {
			postId: getCurrentPostId(),
			postType: getCurrentPostType(),
		};
	}, [] );

	// Get current pattern metadata
	const patternMetadata = useSelect(
		( select ) => {
			if ( ! postId || ! postType ) {
				return null;
			}

			const { getEditedEntityRecord } = select( 'core' );
			const post = getEditedEntityRecord( 'postType', postType, postId );

			if ( ! post ) {
				return null;
			}

			const metadata = post.meta?._pattern_metadata;

			if ( ! metadata ) {
				return {
					alignment: 'default',
					textDensity: 'default',
					mediaDensity: 'default',
					preferredNextAlignment: 'default',
					preferredNextTextDensity: 'default',
					preferredNextMediaDensity: 'default',
				};
			}

			try {
				return typeof metadata === 'string' ? JSON.parse( metadata ) : metadata;
			} catch ( error ) {
				// Return default values if there's an error parsing the metadata.
				return {
					alignment: 'default',
					textDensity: 'default',
					mediaDensity: 'default',
					preferredNextAlignment: 'default',
					preferredNextTextDensity: 'default',
					preferredNextMediaDensity: 'default',
				};
			}
		},
		[ postId, postType ]
	);

	// Update pattern metadata
	const updatePatternMetadata = useCallback(
		( newMetadata ) => {
			if ( ! postId || ! postType ) {
				return;
			}

			const updatedMetadata = {
				...patternMetadata,
				...newMetadata,
			};

			// Update the post meta
			editEntityRecord( 'postType', postType, postId, {
				meta: {
					_pattern_metadata: JSON.stringify( updatedMetadata ),
				},
			} );

			// Mark the editor as dirty
			editPost( {
				meta: { _pattern_metadata: JSON.stringify( updatedMetadata ) },
			} );
		},
		[ postId, postType, patternMetadata, editEntityRecord, editPost ]
	);

	// Individual setter functions
	const setAlignment = useCallback(
		( alignment ) => {
			updatePatternMetadata( { alignment } );
		},
		[ updatePatternMetadata ]
	);

	const setTextDensity = useCallback(
		( textDensity ) => {
			updatePatternMetadata( { textDensity } );
		},
		[ updatePatternMetadata ]
	);

	const setMediaDensity = useCallback(
		( mediaDensity ) => {
			updatePatternMetadata( { mediaDensity } );
		},
		[ updatePatternMetadata ]
	);

	const setPreferredNextAlignment = useCallback(
		( preferredNextAlignment ) => {
			updatePatternMetadata( { preferredNextAlignment } );
		},
		[ updatePatternMetadata ]
	);

	const setPreferredNextTextDensity = useCallback(
		( preferredNextTextDensity ) => {
			updatePatternMetadata( { preferredNextTextDensity } );
		},
		[ updatePatternMetadata ]
	);

	const setPreferredNextMediaDensity = useCallback(
		( preferredNextMediaDensity ) => {
			updatePatternMetadata( { preferredNextMediaDensity } );
		},
		[ updatePatternMetadata ]
	);

	return {
		patternMetadata,
		updatePatternMetadata,
		setAlignment,
		setTextDensity,
		setMediaDensity,
		setPreferredNextAlignment,
		setPreferredNextTextDensity,
		setPreferredNextMediaDensity,
	};
}
