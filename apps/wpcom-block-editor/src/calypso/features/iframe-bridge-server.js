/* eslint-disable import/no-extraneous-dependencies */
/* global calypsoifyGutenberg, Image, MessageChannel, MessagePort */

/**
 * External dependencies
 */
import $ from 'jquery';
import { filter, find, forEach, get, map, partialRight } from 'lodash';
import { dispatch, select, subscribe, use } from '@wordpress/data';
import { createBlock, parse, rawHandler } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { Component } from 'react';
import tinymce from 'tinymce/tinymce';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { inIframe, isEditorReadyWithBlocks, sendMessage } from '../../utils';

const debug = debugFactory( 'wpcom-block-editor:iframe-bridge-server' );

/**
 *
 * Monitors Gutenberg for when an editor is opened with content originally authored in the classic editor.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
async function triggerConversionPrompt( calypsoPort ) {
	const { port1, port2 } = new MessageChannel();

	const editorHasBlocks = await isEditorReadyWithBlocks();
	if ( ! editorHasBlocks ) {
		return;
	}

	const blocks = select( 'core/editor' ).getBlocks();
	const eligible = blocks.length === 1 && blocks[ 0 ].name === 'core/freeform';

	if ( ! eligible ) {
		return;
	}

	calypsoPort.postMessage( { action: 'triggerConversionRequest' }, [ port2 ] );

	port1.onmessage = ( { data: confirmed } ) => {
		port1.close();

		if ( confirmed !== true ) {
			return;
		}

		dispatch( 'core/editor' ).replaceBlock(
			blocks[ 0 ].clientId,
			rawHandler( {
				HTML: blocks[ 0 ].originalContent,
			} )
		);
	};
}

/**
 * Monitors Gutenberg store for draft ID assignment and transmits it to parent frame when needed.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function transmitDraftId( calypsoPort ) {
	// Bail if we are not writing a new post.
	if ( ! /wp-admin\/post-new.php/.test( window.location.href ) ) {
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
	use( ( registry ) => {
		return {
			dispatch: ( namespace ) => {
				const actions = { ...registry.dispatch( namespace ) };
				if ( namespace === 'core/editor' && actions.trashPost ) {
					actions.trashPost = () => {
						debug( 'override core/editor trashPost action to use postlist trash' );
						calypsoPort.postMessage( { action: 'trashPost' } );
					};
				}
				return actions;
			},
		};
	} );
}

function overrideRevisions( calypsoPort ) {
	$( '#editor' ).on( 'click', '[href*="revision.php"]', ( e ) => {
		e.preventDefault();

		calypsoPort.postMessage( { action: 'openRevisions' } );

		calypsoPort.addEventListener( 'message', onLoadRevision, false );
		calypsoPort.start();
	} );

	function onLoadRevision( message ) {
		const action = get( message, 'data.action', '' );
		const payload = get( message, 'data.payload', null );

		if ( action === 'loadRevision' && payload ) {
			const blocks = parse( payload.content );
			dispatch( 'core/editor' ).editPost( payload );
			dispatch( 'core/editor' ).resetBlocks( blocks );
			dispatch( 'core/notices' ).removeNotice( 'autosave-exists' );

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
			// registered. There is an unstable selector for that, so we use
			// `isCleanNewPost` otherwise which is triggered when everything is
			// initialized if the post is new.
			const editorIsReady = select( 'core/editor' ).__unstableIsEditorReady
				? select( 'core/editor' ).__unstableIsEditorReady()
				: select( 'core/editor' ).isCleanNewPost();
			if ( ! editorIsReady ) {
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

			dispatch( 'core/editor' ).resetEditorBlocks( blocks );
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
				( event ) => {
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
				( event ) => {
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

function handlePostStatusChange( calypsoPort ) {
	// Keep a reference to the current status
	let status = select( 'core/editor' ).getEditedPostAttribute( 'status' );

	subscribe( () => {
		const newStatus = select( 'core/editor' ).getEditedPostAttribute( 'status' );
		if ( status === newStatus ) {
			// The status has not changed
			return;
		}

		if ( select( 'core/editor' ).isEditedPostDirty() ) {
			// Wait for the status change to be confirmed by the server
			return;
		}

		// Did the client know about the status before this update?
		const hadStatus = !! status;

		// Update our reference to the current status
		status = newStatus;

		if ( ! hadStatus ) {
			// We didn't have a status before this update, so, don't notify
			return;
		}

		// Notify that the status has changed
		calypsoPort.postMessage( { action: 'postStatusChange', payload: { status } } );
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
	 * @param {object} image The edited image.
	 * @param {number} image.id The image ID.
	 * @param {string} image.url The new image URL.
	 * @param {string} image.status The new image status. "deleted" or "updated" (default).
	 * @param {number} [image.transientId] The temporary ID assigned to uploading image.
	 */
	function updateImageBlocks( blocks, image ) {
		forEach( blocks, ( block ) => {
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
			updatedImages = filter( currentImages, ( currentImage ) => {
				return currentImage.id !== image.id && currentImage.id !== image.transientId;
			} );
			dispatch( 'core/editor' ).updateBlockAttributes( block.clientId, {
				[ attrNames.images ]: updatedImages,
			} );
			return;
		}

		preloadImage( image.url ).then( () => {
			updatedImages = map( currentImages, ( currentImage ) => {
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
	$( '#editor' ).on( 'click', '.editor-post-preview', ( e ) => {
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
			const previewUrl = select( 'core/editor' ).getEditedPostPreviewLink();
			if ( previewUrl ) {
				unsubscribe();
				sendPreviewData();
			}
		} );

		function sendPreviewData() {
			const previewUrl = select( 'core/editor' ).getEditedPostPreviewLink();

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
function handleCloseEditor( calypsoPort ) {
	const legacySelector = '.edit-post-fullscreen-mode-close__toolbar a'; // maintain support for Gutenberg plugin < v7.7
	const selector = '.edit-post-header .edit-post-fullscreen-mode-close';
	const siteEditorSelector = '.edit-site-header .edit-site-fullscreen-mode-close';

	const dispatchAction = ( e ) => {
		e.preventDefault();

		const { port2 } = new MessageChannel();
		calypsoPort.postMessage(
			{
				action: 'closeEditor',
				payload: {
					unsavedChanges: select( 'core/editor' ).isEditedPostDirty(),
				},
			},
			[ port2 ]
		);
	};

	$( '#editor' ).on( 'click', `${ legacySelector }, ${ selector }`, dispatchAction );
	$( '#edit-site-editor' ).on( 'click', `${ siteEditorSelector }`, dispatchAction );
}

/**
 * Modify links in order to open them in parent window and not in a child iframe.
 */
function openLinksInParentFrame() {
	const viewPostLinkSelectors = [
		'.components-notice-list .is-success .components-notice__action.is-link', // View Post link in success notice, Gutenberg <5.9
		'.components-snackbar-list .components-snackbar__content a', // View Post link in success snackbar, Gutenberg >=5.9
		'.post-publish-panel__postpublish .components-panel__body.is-opened a', // Post title link in publish panel
		'.components-panel__body.is-opened .post-publish-panel__postpublish-buttons a.components-button', // View Post button in publish panel
	].join( ',' );
	$( '#editor' ).on( 'click', viewPostLinkSelectors, ( e ) => {
		e.preventDefault();
		window.open( e.target.href, '_top' );
	} );

	if ( calypsoifyGutenberg.manageReusableBlocksUrl ) {
		const manageReusableBlocksLinkSelectors = [
			'.editor-inserter__manage-reusable-blocks', // Link in the Blocks Inserter
			'a.components-menu-item__button[href*="post_type=wp_block"]', // Link in the More Menu
		].join( ',' );
		$( '#editor' ).on( 'click', manageReusableBlocksLinkSelectors, ( e ) => {
			e.preventDefault();
			window.open( calypsoifyGutenberg.manageReusableBlocksUrl, '_top' );
		} );
	}
}

/**
 * Ensures the Calypso Customizer is opened when clicking on the FSE blocks' edit buttons.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function openCustomizer( calypsoPort ) {
	const customizerLinkSelector = 'a.components-button[href*="customize.php"]';
	$( '#editor' ).on( 'click', customizerLinkSelector, ( e ) => {
		e.preventDefault();

		calypsoPort.postMessage( {
			action: 'openCustomizer',
			payload: {
				unsavedChanges: select( 'core/editor' ).isEditedPostDirty(),
				autofocus: getQueryArg( e.currentTarget.href, 'autofocus' ),
			},
		} );
	} );
}

/**
 * Sends a message to Calypso when clicking the "Edit Header" or "Edit Footer"
 * buttons in order to perform the navigation in Calypso instead of in the iFrame.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function openTemplatePartLinks( calypsoPort ) {
	$( '#editor' ).on( 'click', '.template__block-container .template-block__overlay a', ( e ) => {
		e.preventDefault();
		e.stopPropagation(); // Otherwise it will port the message twice.

		// Get the template part ID from the current href.
		const templatePartId = parseInt( getQueryArg( e.target.href, 'post' ), 10 );

		const { port2 } = new MessageChannel();
		calypsoPort.postMessage(
			{
				action: 'openTemplatePart',
				payload: {
					templatePartId,
					unsavedChanges: select( 'core/editor' ).isEditedPostDirty(),
				},
			},
			[ port2 ]
		);
	} );
}

/**
 * Ensures the calypsoifyGutenberg close URL matches the one on the client.
 * This is important because we modify the close URL client side in the
 * context of template part blocks in FSE.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function getCloseButtonUrl( calypsoPort ) {
	const { port1, port2 } = new MessageChannel();
	calypsoPort.postMessage(
		{
			action: 'getCloseButtonUrl',
			payload: {},
		},
		[ port2 ]
	);
	port1.onmessage = ( { data } ) => {
		const { closeUrl, label } = data;
		calypsoifyGutenberg.closeUrl = closeUrl;
		calypsoifyGutenberg.closeButtonLabel = label;

		window.wp.hooks.doAction( 'updateCloseButtonOverrides', data );
	};
}

/**
 * Ensures gutenboarding status and corresponding data is placed on the calypsoifyGutenberg object.
 * This is imporant because it allows us to adapt small changes to the editor when
 * used in the context of Gutenboarding.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function getGutenboardingStatus( calypsoPort ) {
	const { port1, port2 } = new MessageChannel();
	calypsoPort.postMessage(
		{
			action: 'getGutenboardingStatus',
			payload: {},
		},
		[ port2 ]
	);
	port1.onmessage = ( { data } ) => {
		const { isGutenboarding, frankenflowUrl } = data;
		calypsoifyGutenberg.isGutenboarding = isGutenboarding;
		calypsoifyGutenberg.frankenflowUrl = frankenflowUrl;
		// Hook necessary if message recieved after editor has loaded.
		window.wp.hooks.doAction( 'setGutenboardingStatus', isGutenboarding );
	};
}

/**
 * Passes uncaught errors in window.onerror to Calypso for logging.
 *
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handleUncaughtErrors( calypsoPort ) {
	window.onerror = ( ...error ) => {
		// Since none of Error's properties are enumerable, JSON.stringify does not work on it.
		// We therefore stringify the error with a custom replacer containing the object's properties.
		const errorObject = error[ 4 ]; // the 5th argument is the error object
		error[ 4 ] =
			errorObject && JSON.stringify( errorObject, Object.getOwnPropertyNames( errorObject ) );

		// The other parameters don't need encoded since they are numbers or strings.
		calypsoPort.postMessage( {
			action: 'logError',
			payload: { error },
		} );
	};
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

		// Check if the "Convert to Blocks" prompt should be opened for this content.
		triggerConversionPrompt( calypsoPort );

		handlePostTrash( calypsoPort );

		overrideRevisions( calypsoPort );

		handlePressThis( calypsoPort );

		// handle post state change to locked (current user not editing)
		handlePostLocked( calypsoPort );

		// handle post lock state change to takeover
		handlePostLockTakeover( calypsoPort );

		handlePostStatusChange( calypsoPort );

		handleUpdateImageBlocks( calypsoPort );

		handleInsertClassicBlockMedia( calypsoPort );

		handlePreview( calypsoPort );

		handleCloseEditor( calypsoPort );

		openLinksInParentFrame();

		openCustomizer( calypsoPort );

		openTemplatePartLinks( calypsoPort );

		getCloseButtonUrl( calypsoPort );

		getGutenboardingStatus( calypsoPort );

		handleUncaughtErrors( calypsoPort );
	}

	window.removeEventListener( 'message', initPort, false );
}

$( () => {
	window.addEventListener( 'message', initPort, false );

	//signal module loaded
	sendMessage( { action: 'loaded' } );
} );
