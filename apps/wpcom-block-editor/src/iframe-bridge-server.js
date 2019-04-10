/* global calypsoifyGutenberg */

/**
 * External dependencies
 */
import $ from 'jquery';
import { filter, find, forEach, get, map, partialRight } from 'lodash';
import { dispatch, select, subscribe } from '@wordpress/data';
import { createBlock, parse } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { Component } from 'react';
import tinymce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import { inIframe, sendMessage } from './utils';

/**
 * Monitors Gutenberg store for draft ID assignment and transmits it to parent frame when needed.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function transmitDraftId( calypsoPort ) {
	// Bail if we are not writing a new post.
	if ( ! /wp-admin\/post-new.php/.test( location.href ) ) {
		return;
	}

	const unsubscribe = subscribe( () => {
		const currentPost = select( 'core/editor' ).getCurrentPost();

		if ( currentPost && currentPost.id && currentPost.status !== 'auto-draft' ) {
			calypsoPort.postMessage( {
				action: 'draftIdSet',
				payload: { postId: currentPost.id },
			} );

			unsubscribe();
		}
	} );
}

/**
 * Sends a message to the parent frame when the "Move to trash" button is clicked.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handlePostTrash( calypsoPort ) {
	$( '#editor' ).on( 'click', '.editor-post-trash', e => {
		e.preventDefault();

		calypsoPort.postMessage( { action: 'trashPost' } );
	} );
}

function overrideRevisions( calypsoPort ) {
	$( '#editor' ).on(
		'click',
		'.components-panel .edit-post-last-revision__panel .editor-post-last-revision__title',
		e => {
			e.preventDefault();

			calypsoPort.postMessage( { action: 'openRevisions' } );

			calypsoPort.addEventListener( 'message', onLoadRevision, false );
			calypsoPort.start();
		}
	);

	function onLoadRevision( message ) {
		const action = get( message, 'data.action', '' );
		const payload = get( message, 'data.payload', null );

		if ( action === 'loadRevision' && payload ) {
			const currentPost = select( 'core/editor' ).getCurrentPost();
			const postRevision = { ...currentPost, ...payload };
			const blocks = parse( postRevision.content );

			dispatch( 'core/editor' ).updatePost( postRevision );
			dispatch( 'core/editor' ).resetBlocks( blocks );

			calypsoPort.removeEventListener( 'message', onLoadRevision, false );
		}
	}
}

/**
 * Adds support for Press This/Reblog.
 *
 * @param {MessagePort} calypsoPort port used for communication with parent frame.
 */
function handlePressThis( calypsoPort ) {
	calypsoPort.addEventListener( 'message', onPressThis, false );
	calypsoPort.start();

	function onPressThis( message ) {
		const action = get( message, 'data.action' );
		const payload = get( message, 'data.payload' );
		if ( action !== 'pressThis' || ! payload ) {
			return;
		}

		calypsoPort.removeEventListener( 'message', onPressThis, false );

		const unsubscribe = subscribe( () => {
			// Calypso sends the message as soon as the iframe is loaded, so we
			// need to be sure that the editor is initialized and the core blocks
			// registered. There is no specific hook or selector for that, so we use
			// `isCleanNewPost` which is triggered when everything is initialized if
			// the post is new.
			const isCleanNewPost = select( 'core/editor' ).isCleanNewPost();
			if ( ! isCleanNewPost ) {
				return;
			}

			unsubscribe();

			const title = get( payload, 'title' );
			const text = get( payload, 'text' );
			const url = get( payload, 'url' );
			const image = get( payload, 'image' );
			const embed = get( payload, 'embed' );
			const link = `<a href="${ url }">${ title }</a>`;

			const blocks = [];

			if ( embed ) {
				blocks.push( createBlock( 'core/embed', { url: embed } ) );
			}

			if ( image ) {
				blocks.push(
					createBlock( 'core/image', {
						url: image,
						caption: text ? '' : link,
					} )
				);
			}

			if ( text ) {
				blocks.push(
					createBlock( 'core/quote', {
						value: `<p>${ text }</p>`,
						citation: link,
					} )
				);
			}

			dispatch( 'core/editor' ).resetBlocks( blocks );
			dispatch( 'core/editor' ).editPost( { title: title } );
		} );
	}
}

/**
 * Listens for post lock status changing to locked, and overrides the modal dialog
 * actions, addind an event handler for the All Posts button, and changing the
 * Take Over Url to work inside the iframe.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handlePostLocked( calypsoPort ) {
	const unsubscribe = subscribe( () => {
		const isLocked = select( 'core/editor' ).isPostLocked();
		const isLockTakeover = select( 'core/editor' ).isPostLockTakeover();
		const lockedDialogButtons = document.querySelectorAll(
			'div.editor-post-locked-modal__buttons > a'
		);

		const isPostTakeoverDialog = isLocked && ! isLockTakeover && lockedDialogButtons.length === 3;

		if ( isPostTakeoverDialog ) {
			//signal the parent frame to navigate to All Posts
			lockedDialogButtons[ 0 ].addEventListener(
				'click',
				event => {
					event.preventDefault();
					calypsoPort.postMessage( { action: 'goToAllPosts' } );
				},
				false
			);

			//overrides the all posts link just in case the user treats the link... as a link.
			if ( calypsoifyGutenberg && calypsoifyGutenberg.closeUrl ) {
				lockedDialogButtons[ 0 ].setAttribute( 'target', '_parent' );
				lockedDialogButtons[ 0 ].setAttribute( 'href', calypsoifyGutenberg.closeUrl );
			}

			//changes the Take Over link url to add the frame-nonce
			lockedDialogButtons[ 2 ].setAttribute(
				'href',
				addQueryArgs( lockedDialogButtons[ 2 ].getAttribute( 'href' ), {
					calypsoify: 1,
					'frame-nonce': getQueryArg( window.location.href, 'frame-nonce' ),
				} )
			);

			unsubscribe();
		}
	} );
}

/**
 * Listens for post lock status changing to locked, and for the post to have been taken over
 * by another user, adding an event handler for the All Posts button.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handlePostLockTakeover( calypsoPort ) {
	const unsubscribe = subscribe( () => {
		const isLocked = select( 'core/editor' ).isPostLocked();
		const isLockTakeover = select( 'core/editor' ).isPostLockTakeover();
		const allPostsButton = document.querySelector( 'div.editor-post-locked-modal__buttons > a' );

		const isPostTakeoverDialog = isLocked && isLockTakeover && allPostsButton;

		if ( isPostTakeoverDialog ) {
			//handle All Posts button click event
			allPostsButton.addEventListener(
				'click',
				event => {
					event.preventDefault();
					calypsoPort.postMessage( { action: 'goToAllPosts' } );
				},
				false
			);

			//overrides the all posts link just in case the user treats the link... as a link.
			if ( calypsoifyGutenberg && calypsoifyGutenberg.closeUrl ) {
				allPostsButton.setAttribute( 'target', '_parent' );
				allPostsButton.setAttribute( 'href', calypsoifyGutenberg.closeUrl );
			}

			unsubscribe();
		}
	} );
}

/**
 * Listens for image changes or removals happening in the Media Modal,
 * and updates accordingly all blocks containing them.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handleUpdateImageBlocks( calypsoPort ) {
	calypsoPort.addEventListener( 'message', onUpdateImageBlocks, false );
	calypsoPort.start();

	const imageBlocks = {
		'core/cover': updateSingeImageBlock,
		'core/image': updateSingeImageBlock,
		'core/file': partialRight( updateSingeImageBlock, { url: 'href' } ),
		'core/gallery': updateMultipleImagesBlock,
		'core/media-text': partialRight( updateSingeImageBlock, {
			id: 'mediaId',
			url: 'mediaUrl',
		} ),
		'jetpack/tiled-gallery': updateMultipleImagesBlock,
	};

	/**
	 * Updates all the blocks containing a given edited image.
	 *
	 * @param {Array} blocks Array of block objects for the current post.
	 * @param {Object} image The edited image.
	 * @param {number} image.id The image ID.
	 * @param {string} image.url The new image URL.
	 * @param {string} image.status The new image status. "deleted" or "updated" (default).
	 * @param {number} [image.transientId] The temporary ID assigned to uploading image.
	 */
	function updateImageBlocks( blocks, image ) {
		forEach( blocks, block => {
			if ( imageBlocks[ block.name ] ) {
				imageBlocks[ block.name ]( block, image );
			}
			if ( block.innerBlocks.length ) {
				updateImageBlocks( block.innerBlocks, image );
			}
		} );
	}

	function preloadImage( imageUrl ) {
		return new Promise( ( resolve, reject ) => {
			const preloadedImage = new Image();
			preloadedImage.src = imageUrl;
			preloadedImage.onload = resolve;
			preloadedImage.onerror = reject;
		} );
	}

	function updateSingeImageBlock( block, image, attrNames ) {
		const blockImageId = get( block, 'attributes.id' );
		if ( blockImageId !== image.id && blockImageId !== image.transientId ) {
			return;
		}
		attrNames = { ...attrNames, id: 'id', url: 'url' };

		if ( 'deleted' === image.status ) {
			dispatch( 'core/editor' ).updateBlockAttributes( block.clientId, {
				[ attrNames.id ]: undefined,
				[ attrNames.url ]: undefined,
			} );
			return;
		}

		preloadImage( image.url ).then( () => {
			dispatch( 'core/editor' ).updateBlockAttributes( block.clientId, {
				[ attrNames.id ]: image.id,
				[ attrNames.url ]: image.url,
			} );
		} );
	}

	function updateMultipleImagesBlock( block, image, attrNames ) {
		attrNames = { ...attrNames, id: 'id', url: 'url', images: 'images' };
		const currentImages = get( block, [ 'attributes', attrNames.images ] );
		let updatedImages = [];

		if ( 'deleted' === image.status ) {
			updatedImages = filter( currentImages, currentImage => {
				return currentImage.id !== image.id && currentImage.id !== image.transientId;
			} );
			dispatch( 'core/editor' ).updateBlockAttributes( block.clientId, {
				[ attrNames.images ]: updatedImages,
			} );
			return;
		}

		preloadImage( image.url ).then( () => {
			updatedImages = map( currentImages, currentImage => {
				const currentImageId = parseInt( currentImage.id, 10 );
				if ( currentImageId !== image.id && currentImageId !== image.transientId ) {
					return currentImage;
				}
				return {
					[ attrNames.id ]: image.id,
					[ attrNames.url ]: image.url,
				};
			} );
			dispatch( 'core/editor' ).updateBlockAttributes( block.clientId, {
				[ attrNames.images ]: updatedImages,
			} );
		} );
	}

	// To update the featured image preview we need to manually modify the image in the `core` state.
	// Though, there is no direct mechanism to also invalidate its cache and re-render the preview.
	// As a workaround, we call `receiveEntityRecords`, normally used to update the state after a fetch,
	// which has a handy `invalidateCache` parameter that does exactly what we need.
	function updateFeaturedImagePreview( image ) {
		const currentImageId = select( 'core/editor' ).getEditedPostAttribute( 'featured_media' );
		if ( currentImageId !== image.id ) {
			return;
		}
		preloadImage( image.url ).then( () => {
			const currentImage = select( 'core' ).getMedia( currentImageId );
			const updatedImage = {
				...currentImage,
				media_details: {
					height: image.height,
					width: image.width,
				},
				source_url: image.url,
			};
			dispatch( 'core' ).receiveEntityRecords( 'root', 'media', [ updatedImage ], null, true );
		} );
	}

	function onUpdateImageBlocks( message ) {
		const action = get( message, 'data.action' );
		if ( action !== 'updateImageBlocks' ) {
			return;
		}
		const image = get( message, 'data.payload' );
		updateImageBlocks( select( 'core/editor' ).getBlocks(), image );
		updateFeaturedImagePreview( image );
	}
}

/**
 * Prevents the default preview flow and sends a message to the parent frame
 * so we preview a post from there.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handlePreview( calypsoPort ) {
	$( '#editor' ).on( 'click', '.editor-post-preview', e => {
		e.preventDefault();
		e.stopPropagation();

		const postUrl = select( 'core/editor' ).getCurrentPostAttribute( 'link' );
		const previewChannel = new MessageChannel();

		calypsoPort.postMessage(
			{
				action: 'previewPost',
				payload: {
					postUrl: postUrl,
				},
			},
			[ previewChannel.port2 ]
		);

		const isAutosaveable = select( 'core/editor' ).isEditedPostAutosaveable();

		// If we don't need to autosave the post before previewing, then we simply
		// generate the preview.
		if ( ! isAutosaveable ) {
			sendPreviewData();
			return;
		}

		// Request an autosave before generating the preview.
		const postStatus = select( 'core/editor' ).getEditedPostAttribute( 'status' );
		const isDraft = [ 'draft', 'auto-draft' ].indexOf( postStatus ) !== -1;
		if ( isDraft ) {
			dispatch( 'core/editor' ).savePost( { isPreview: true } );
		} else {
			dispatch( 'core/editor' ).autosave( { isPreview: true } );
		}
		const unsubscribe = subscribe( () => {
			const isSavingPost = select( 'core/editor' ).isSavingPost();
			if ( ! isSavingPost ) {
				unsubscribe();
				sendPreviewData();
			}
		} );

		function sendPreviewData() {
			const previewUrl = e.target.href;

			const featuredImageId = select( 'core/editor' ).getEditedPostAttribute( 'featured_media' );
			const featuredImage = featuredImageId
				? get( select( 'core' ).getMedia( featuredImageId ), 'source_url' )
				: null;

			const authorId = select( 'core/editor' ).getCurrentPostAttribute( 'author' );
			const author = find( select( 'core' ).getAuthors(), { id: authorId } );
			const editedPost = {
				title: select( 'core/editor' ).getEditedPostAttribute( 'title' ),
				URL: select( 'core/editor' ).getEditedPostAttribute( 'link' ),
				excerpt: select( 'core/editor' ).getEditedPostAttribute( 'excerpt' ),
				content: select( 'core/editor' ).getEditedPostAttribute( 'content' ),
				featured_image: featuredImage,
				author: author,
			};

			previewChannel.port1.postMessage( {
				previewUrl: previewUrl,
				editedPost: editedPost,
			} );
			previewChannel.port1.close();
		}
	} );
}

/**
 * Listens for insert media events happening in a Media Modal opened in a Classic Block,
 * and inserts the media into the appropriate block.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handleInsertClassicBlockMedia( calypsoPort ) {
	calypsoPort.addEventListener( 'message', onInsertClassicBlockMedia, false );
	calypsoPort.start();

	function onInsertClassicBlockMedia( message ) {
		const action = get( message, 'data.action' );
		if ( action !== 'insertClassicBlockMedia' ) {
			return;
		}
		const editorId = get( message, 'data.payload.editorId' );
		const media = get( message, 'data.payload.media' );
		tinymce.editors[ editorId ].execCommand( 'mceInsertContent', false, media );
	}
}

/**
 * Prevents the default closing flow and sends a message to the parent frame to
 * perform the navigation on the client side.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handleGoToAllPosts( calypsoPort ) {
	$( '#editor' ).on( 'click', '.edit-post-fullscreen-mode-close__toolbar a', e => {
		e.preventDefault();
		calypsoPort.postMessage( {
			action: 'goToAllPosts',
			payload: {
				unsavedChanges: select( 'core/editor' ).isEditedPostDirty(),
			},
		} );
	} );
}

function initPort( message ) {
	if ( 'initPort' !== message.data.action ) {
		return;
	}

	const calypsoPort = message.ports[ 0 ];

	class MediaUpload extends Component {
		openModal = () => {
			const mediaChannel = new MessageChannel();

			calypsoPort.postMessage(
				{
					action: 'openMediaModal',
					payload: {
						allowedTypes: this.props.allowedTypes,
						gallery: this.props.gallery,
						multiple: this.props.multiple,
						value: this.props.value,
					},
				},
				[ mediaChannel.port2 ]
			);

			mediaChannel.port1.onmessage = ( { data } ) => {
				this.props.onSelect( data );

				// this is a once-only port
				// to send more messages we have to re-open the
				// modal and create a new channel
				mediaChannel.port1.close();
			};
		};

		render() {
			return this.props.render( { open: this.openModal } );
		}
	}

	const replaceMediaUpload = () => MediaUpload;

	if ( inIframe() ) {
		// Replace Core's default Media Library
		addFilter(
			'editor.MediaUpload',
			'core/edit-post/components/media-upload/replace-media-upload',
			replaceMediaUpload
		);

		// Transmit draft ID to parent window once it has been assigned.
		transmitDraftId( calypsoPort );

		handlePostTrash( calypsoPort );

		overrideRevisions( calypsoPort );

		handlePressThis( calypsoPort );

		// handle post state change to locked (current user not editing)
		handlePostLocked( calypsoPort );

		// handle post lock state change to takeover
		handlePostLockTakeover( calypsoPort );

		handleUpdateImageBlocks( calypsoPort );

		handleInsertClassicBlockMedia( calypsoPort );

		handlePreview( calypsoPort );

		handleGoToAllPosts( calypsoPort );
	}

	window.removeEventListener( 'message', initPort, false );
}

$( () => {
	window.addEventListener( 'message', initPort, false );

	//signal module loaded
	sendMessage( { action: 'loaded' } );
} );
