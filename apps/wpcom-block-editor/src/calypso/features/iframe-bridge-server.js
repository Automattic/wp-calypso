/* global calypsoifyGutenberg, Image, requestAnimationFrame */

import { parse } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { dispatch, select, subscribe, use } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { __experimentalMainDashboardButton as MainDashboardButton } from '@wordpress/edit-post';
import { addAction, addFilter, doAction, removeAction } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { registerPlugin } from '@wordpress/plugins';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import debugFactory from 'debug';
import { filter, forEach, get, map } from 'lodash';
import { Component, useEffect, useState } from 'react';
import tinymce from 'tinymce/tinymce';
import {
	getPages,
	getPostTypeRecords,
	inIframe,
	isEditorReady,
	isEditorReadyWithBlocks,
	sendMessage,
} from '../../utils';

const debug = debugFactory( 'wpcom-block-editor:iframe-bridge-server' );

const clickOverrides = {};
let addedClickListener = false;
// Replicates basic '$( el ).on( selector, cb )'.
function addEditorListener( selector, cb ) {
	clickOverrides[ selector ] = cb;
	if ( ! addedClickListener ) {
		document
			.querySelector( 'body.is-iframed' )
			?.addEventListener( 'click', triggerOverrideHandler );
		addedClickListener = true;
	}
}

const enterOverrides = {};
let addedEnterListener = false;
function addCommandsInputListener( selector, cb ) {
	enterOverrides[ selector ] = cb;

	if ( ! addedEnterListener ) {
		document.querySelector( 'body.is-iframed' )?.addEventListener( 'keydown', ( e ) => {
			const isInputActive = document.activeElement?.matches(
				'.commands-command-menu__header input'
			);
			const selectedCommand = document.querySelector( '[data-selected=true]' );

			if ( e.key === 'Enter' && isInputActive && !! selectedCommand ) {
				const matchingSelector = Object.keys( enterOverrides ).find( ( _selector ) => {
					return selectedCommand.matches( _selector );
				} );

				if ( matchingSelector ) {
					const callback = enterOverrides[ matchingSelector ];

					callback?.( e );
				}
			}
		} );

		addedEnterListener = true;
	}
}

/**
 * Returns the Popover fallback container if exists or creates a new node
 */
const fallbackContainerClassname = 'components-popover__fallback-container';
const getPopoverFallbackContainer = () => {
	let container = document.body.querySelector( '.' + fallbackContainerClassname );
	if ( ! container ) {
		container = document.createElement( 'div' );
		container.className = fallbackContainerClassname;
		document.body.append( container );
	}

	return container;
};

// Calls a callback if the event occured on an element or parent thereof matching
// the callback's selector. This is needed because elements are added and removed
// from the DOM dynamically after the listeners are created. We need to handle
// clicks anyways, so directly accessing the elements and adding listeners to them
// is not viable.
function triggerOverrideHandler( e ) {
	const allSelectors = Object.keys( clickOverrides ).join( ', ' );
	const matchingElement = e.target.closest( allSelectors );

	if ( ! matchingElement ) {
		return;
	}

	// Find the correct callback to use for this clicked element.
	for ( const [ selector, cb ] of Object.entries( clickOverrides ) ) {
		matchingElement.matches( selector ) && cb( e );
	}
}

/**
 * Monitors Gutenberg store for draft ID assignment and transmits it to parent frame when needed.
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
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handlePostTrash( calypsoPort ) {
	/**
	 * As of Gutenberg 18.2, posts are trashed with code that we cannot override
	 * via the actions registry, so we need to change the behavior overriding the
	 * onClick event.
	 *
	 * See https://github.com/WordPress/gutenberg/blob/379e5f42d11a46dfa29fe4c595ba43f1f3ba9b17/packages/editor/src/components/post-actions/actions.js#L122-L220
	 */
	addEditorListener( '.editor-action-modal__move-to-trash button.is-primary', ( e ) => {
		e.preventDefault();
		calypsoPort.postMessage( { action: 'trashPost' } );
	} );

	use( ( registry ) => {
		return {
			dispatch: ( store ) => {
				/**
				 * Gutenberg 10.8.0 changed the way wp-data stores are referenced and uses
				 * the store definition as the ID.
				 * We need to keep supporting the old approach to make sure this also
				 * works when Gutenberg < 10.8.0 is being used.
				 * More context:
				 * - https://github.com/WordPress/gutenberg/issues/27088;
				 * - https://github.com/WordPress/gutenberg/pull/32153.
				 */
				const namespace = store.name ?? store;
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
	addEditorListener( '[href*="revision.php"]', ( e ) => {
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
 * Listens for post lock status changing to locked, and overrides the modal dialog
 * actions, addind an event handler for the All Posts button, and changing the
 * Take Over Url to work inside the iframe.
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handlePostLocked( calypsoPort ) {
	const unsubscribe = subscribe( () => {
		const isLocked = select( 'core/editor' ).isPostLocked();
		const isLockTakeover = select( 'core/editor' ).isPostLockTakeover();

		if ( isLocked && ! isLockTakeover ) {
			const lockedDialogButtons = document.querySelectorAll(
				'div.editor-post-locked-modal__buttons > a'
			);

			if ( lockedDialogButtons.length === 3 ) {
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
		}
	} );
}

/**
 * Listens for post lock status changing to locked, and for the post to have been taken over
 * by another user, adding an event handler for the All Posts button.
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handlePostLockTakeover( calypsoPort ) {
	const unsubscribe = subscribe( () => {
		const isLocked = select( 'core/editor' ).isPostLocked();
		const isLockTakeover = select( 'core/editor' ).isPostLockTakeover();

		if ( isLocked && isLockTakeover ) {
			const allPostsButton = document.querySelector( 'div.editor-post-locked-modal__buttons > a' );

			if ( allPostsButton ) {
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
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handleUpdateImageBlocks( calypsoPort ) {
	calypsoPort.addEventListener( 'message', onUpdateImageBlocks, false );
	calypsoPort.start();

	const imageBlocks = {
		'core/cover': updateSingleImageBlock,
		'core/image': updateSingleImageBlock,
		'core/file': ( block, image ) => updateSingleImageBlock( block, image, { url: 'href' } ),
		'core/gallery': updateMultipleImagesBlock,
		'core/media-text': ( block, image ) =>
			updateSingleImageBlock( block, image, { id: 'mediaId', url: 'mediaUrl' } ),
		'jetpack/tiled-gallery': updateMultipleImagesBlock,
	};

	/**
	 * Updates all the blocks containing a given edited image.
	 * @param {Array} blocks Array of block objects for the current post.
	 * @param {Object} image The edited image.
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

	function updateSingleImageBlock( block, image, attrNames ) {
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
 * Listens for insert media events happening in a Media Modal opened in a Classic Block,
 * and inserts the media into the appropriate block.
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
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handleCloseEditor( calypsoPort ) {
	addAction(
		'a8c.wpcom-block-editor.closeEditor',
		'a8c/wpcom-block-editor/closeEditor',
		( destinationUrl ) => {
			const { port2 } = new MessageChannel();
			calypsoPort.postMessage(
				{
					action: 'closeEditor',
					payload: {
						unsavedChanges:
							select( 'core' ).__experimentalGetDirtyEntityRecords?.().length > 0 ||
							select( 'core/editor' ).isEditedPostDirty(),
						destinationUrl,
					},
				},
				[ port2 ]
			);
		}
	);

	const dispatchAction = ( e ) => {
		e.preventDefault();
		doAction( 'a8c.wpcom-block-editor.closeEditor' );
	};

	handleCloseInLegacyEditors( dispatchAction );

	if ( ! MainDashboardButton ) {
		return;
	}

	registerPlugin( 'a8c-wpcom-block-editor-close-button-override', {
		render: function CloseWpcomBlockEditor() {
			const [ closeUrl, setCloseUrl ] = useState( calypsoifyGutenberg.closeUrl );
			const [ label, setLabel ] = useState( calypsoifyGutenberg.closeButtonLabel );

			useEffect( () => {
				addAction(
					'updateCloseButtonOverrides',
					'a8c/wpcom-block-editor/CloseWpcomBlockEditor',
					( data ) => {
						setCloseUrl( data.closeUrl );
						setLabel( data.label );
					}
				);
				return () =>
					removeAction(
						'updateCloseButtonOverrides',
						'a8c/wpcom-block-editor/CloseWpcomBlockEditor'
					);
			} );

			return (
				<MainDashboardButton>
					<Button
						// eslint-disable-next-line wpcalypso/jsx-classname-namespace
						className="edit-post-fullscreen-mode-close wpcom-block-editor__close-button"
						href={ closeUrl }
						icon={ wordpress }
						iconSize={ 36 }
						label={ label }
						onClick={ dispatchAction }
					/>
				</MainDashboardButton>
			);
		},
	} );
}

// The close button is generally overridden using the <MainDashboardButton> slot API
// which was introduced in Gutenberg 8.2. In older editors we still need to override
// the click handler so that the link will open in the parent frame instead of the
// iframe. We try not to add the click handler if <MainDashboardButton> has been used.
function handleCloseInLegacyEditors( handleClose ) {
	// Selects close buttons in Gutenberg plugin < v7.7
	const legacySelector = '.edit-post-fullscreen-mode-close__toolbar a';
	addEditorListener( legacySelector, handleClose );

	// Selects the close button in modern Gutenberg versions, unless it itself is a close button override
	const wpcomCloseSelector = '.wpcom-block-editor__close-button';
	const selector = `.edit-post-header .edit-post-fullscreen-mode-close:not(${ wpcomCloseSelector })`;
	addEditorListener( selector, handleClose );
}

/**
 * Modify links in order to open them in parent window and not in a child iframe.
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
async function openLinksInParentFrame( calypsoPort ) {
	const viewPostLinks = [
		'.post-publish-panel__postpublish .components-panel__body.is-opened a', // Post title link in publish panel
		'.components-panel__body.is-opened .post-publish-panel__postpublish-buttons a.components-button', // View Post button in publish panel
		'.wpcom-block-editor-post-published-sharing-modal__view-post-link', // View Post button in sharing modal
	].join( ',' );

	addEditorListener( viewPostLinks, ( e ) => {
		// Allows modifiers to open links outside of the current tab using the default behavior.
		if ( e.shiftKey || e.ctrlKey || e.metaKey ) {
			return;
		}
		e.preventDefault();
		calypsoPort.postMessage( {
			action: 'openLinkInParentFrame',
			payload: { postUrl: e.target.href },
		} );
	} );

	await isEditorReadyWithBlocks();

	// Observes the popover slot for the "Manage Patterns" link which can be found
	// in the block's more menu or in the block-editor menu, and for the navigation link.
	const popoverSlotObserver = new window.MutationObserver( ( mutations ) => {
		for ( const record of mutations ) {
			for ( const node of record.addedNodes ) {
				// For some reason, some nodes might be `undefined`, see:
				// https://sentry.io/organizations/a8c/issues/3216750319/?project=5876245.
				// We skip the iteration if that's the case.
				if ( ! node ) {
					continue;
				}

				if ( node?.classList?.contains( 'components-popover' ) ) {
					const manageReusableBlocksAnchorElem = node.querySelector(
						'a[href$="site-editor.php?path=%2Fpatterns"]'
					);

					if ( manageReusableBlocksAnchorElem ) {
						manageReusableBlocksAnchorElem.addEventListener(
							'click',
							( e ) => {
								calypsoPort.postMessage( {
									action: 'openLinkInParentFrame',
									payload: { postUrl: manageReusableBlocksAnchorElem.href },
								} );
								e.preventDefault();
							},
							false
						);
					}

					const manageNavigationMenusAnchorElem = node.querySelector(
						'a[href$="edit.php?post_type=wp_navigation"]'
					);

					if ( manageNavigationMenusAnchorElem ) {
						manageNavigationMenusAnchorElem.addEventListener(
							'click',
							( e ) => {
								calypsoPort.postMessage( {
									action: 'openLinkInParentFrame',
									payload: { postUrl: manageNavigationMenusAnchorElem.href },
								} );
								e.preventDefault();
							},
							false
						);
					}
				}
			}
		}
	} );

	// Observe children of the Popover Container
	const popoverContainer = getPopoverFallbackContainer();
	popoverContainer && popoverSlotObserver.observe( popoverContainer, { childList: true } );

	// Handle the view post link in the snackbar, which unfortunately has a click
	// handler which stops propagation, so we can't override it with the global handler.
	const updateViewPostLinkNotice = () => {
		// This timeout might not be necessary, but replicates the fix for Safari several lines below.
		setTimeout( () => {
			const snackbarLink = document.querySelector(
				'.components-snackbar-list a.components-snackbar__action'
			);
			if ( snackbarLink ) {
				// Make sure this link doesn't open inside the iframe.
				snackbarLink.target = '_blank';
			}
		} );
	};

	// Essentially, when the snackbar list changes, attempt to update the link.
	// Only called once when a snackbar item is added and when removed, so
	// it doesn't cost much.
	const snackbarList = document.querySelector( '.components-snackbar-list' );
	if ( snackbarList ) {
		const snackbarObserver = new window.MutationObserver( updateViewPostLinkNotice );
		snackbarObserver.observe( snackbarList, { childList: true } );
	} else {
		// eslint-disable-next-line no-console
		console.warn(
			'Could not find the snackbar list element so, the "View post" link may open inside the iframe.'
		);
	}
}

/**
 * Ensures the Calypso Customizer is opened when clicking on the FSE blocks' edit buttons.
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function openCustomizer( calypsoPort ) {
	addEditorListener( '[href*="customize.php"]', ( e ) => {
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
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function openTemplatePartLinks( calypsoPort ) {
	addEditorListener( '.template__block-container .template-block__overlay a', ( e ) => {
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

	addFilter(
		'a8c.WpcomBlockEditorNavSidebar.closeUrl',
		'a8c/wpcom-block-editor/getCloseButtonUrl',
		( closeUrl ) => calypsoifyGutenberg.closeUrl || closeUrl
	);

	addFilter(
		'a8c.WpcomBlockEditorNavSidebar.closeLabel',
		'a8c/wpcom-block-editor/getCloseButtonUrl',
		( closeLabel ) => calypsoifyGutenberg.closeButtonLabel || closeLabel
	);
}

/**
 * Ensures gutenboarding status and corresponding data is placed on the calypsoifyGutenberg object.
 * This is imporant because it allows us to adapt small changes to the editor when
 * used in the context of Gutenboarding.
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
		const { isGutenboarding, currentCalypsoUrl } = data;
		calypsoifyGutenberg.isGutenboarding = isGutenboarding;
		calypsoifyGutenberg.currentCalypsoUrl = currentCalypsoUrl;
		// Hook necessary if message recieved after editor has loaded.
		window.wp.hooks.doAction( 'setGutenboardingStatus', isGutenboarding );
	};
}

/**
 * Hooks the nav sidebar to change some of its button labels and behaviour.
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function getNavSidebarLabels( calypsoPort ) {
	let createPostLabels = null;
	let listHeadings = null;

	const { port1, port2 } = new MessageChannel();
	calypsoPort.postMessage(
		{
			action: 'getNavSidebarLabels',
			payload: {},
		},
		[ port2 ]
	);
	port1.onmessage = ( { data } ) => {
		createPostLabels = data.createPostLabels;
		listHeadings = data.listHeadings;
	};

	addFilter(
		'a8c.WpcomBlockEditorNavSidebar.createPostLabel',
		'wpcom-block-editor/getNavSidebarLabels',
		( label, postType ) => ( createPostLabels && createPostLabels[ postType ] ) || label
	);

	addFilter(
		'a8c.WpcomBlockEditorNavSidebar.listHeading',
		'wpcom-block-editor/getNavSidebarLabels',
		( label, postType ) => ( listHeadings && listHeadings[ postType ] ) || label
	);
}

/**
 * Retrieves info to allow the bridge to build calypso urls. Hook parts of
 * the editor that use this info.
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function getCalypsoUrlInfo( calypsoPort ) {
	let origin = null;
	let siteSlug = null;

	const { port1, port2 } = new MessageChannel();
	calypsoPort.postMessage(
		{
			action: 'getCalypsoUrlInfo',
			payload: {},
		},
		[ port2 ]
	);
	port1.onmessage = ( { data } ) => {
		origin = data.origin;
		siteSlug = data.siteSlug;
	};

	addFilter(
		'a8c.WpcomBlockEditorNavSidebar.createPostUrl',
		'wpcom-block-editor/getSiteSlug',
		( url, postType ) => {
			if ( origin && siteSlug && ( postType === 'page' || postType === 'post' ) ) {
				return `${ origin }/block-editor/${ postType }/${ siteSlug }`;
			}

			return url;
		}
	);

	addFilter(
		'a8c.WpcomBlockEditorNavSidebar.editPostUrl',
		'wpcom-block-editor/getSiteSlug',
		( url, postId, postType ) => {
			if ( origin && siteSlug && ( postType === 'page' || postType === 'post' ) ) {
				return `${ origin }/block-editor/${ postType }/${ siteSlug }/${ postId }`;
			}

			return url;
		}
	);

	// All links should open outside the iframe
	addFilter(
		'a8c.WpcomBlockEditorNavSidebar.linkTarget',
		'wpcom-block-editor/getSiteSlug',
		() => '_parent'
	);
}

async function handleEditorLoaded( calypsoPort ) {
	await isEditorReady();
	const isNew = select( 'core/editor' ).isCleanNewPost();
	const blocks = select( 'core/block-editor' ).getBlocks();

	requestAnimationFrame( () => {
		calypsoPort.postMessage( {
			action: 'trackPerformance',
			payload: {
				mark: 'editor.ready',
				isNew,
				blockCount: blocks.length,
			},
		} );
	} );

	preselectParentPage();
}

async function preselectParentPage() {
	const parentPostId = parseInt( getQueryArg( window.location.href, 'parent_post' ) );
	if ( ! parentPostId || isNaN( parseInt( parentPostId ) ) ) {
		return;
	}

	const postType = select( 'core/editor' ).getCurrentPostType();
	if ( 'page' !== postType ) {
		return;
	}

	const pages = await getPages();
	const isValidParentId = pages.some( ( page ) => page.id === parentPostId );
	if ( isValidParentId ) {
		dispatch( 'core/editor' ).editPost( { parent: parentPostId } );
	}
}

function handleCheckoutModalOpened( calypsoPort, data ) {
	const { port1, port2 } = new MessageChannel();

	// Remove checkoutOnSuccessCallback from data to prevent
	// the `data` object could not be cloned in postMessage()
	const { checkoutOnSuccessCallback, ...checkoutModalOptions } = data;

	calypsoPort.postMessage(
		{
			action: 'openCheckoutModal',
			payload: checkoutModalOptions,
		},
		[ port2 ]
	);

	port1.onmessage = () => {
		checkoutOnSuccessCallback?.();
		// this is a once-only port
		// to send more messages we have to re-open the
		// modal and create a new channel
		port1.close();
	};
}

function handleCheckoutModal( calypsoPort ) {
	const { port1, port2 } = new MessageChannel();
	calypsoPort.postMessage(
		{
			action: 'getCheckoutModalStatus',
			payload: {},
		},
		[ port2 ]
	);
	port1.onmessage = ( message ) => {
		const { isCheckoutOverlayEnabled } = message.data;

		// Conditionally add the hook if the feature flag is enabled.
		if ( isCheckoutOverlayEnabled ) {
			addAction(
				'a8c.wpcom-block-editor.openCheckoutModal',
				'a8c/wpcom-block-editor/openCheckoutModal',
				( data ) => {
					handleCheckoutModalOpened( calypsoPort, data );
				}
			);
		}
	};
}

/**
 * If WelcomeTour is set to show, check if the App Banner is visible.
 * If App Banner is visible, we set the Welcome Tour to not show.
 * When the App Banner gets dismissed, we set the Welcome Tour to show.
 * @param {MessagePort} calypsoPort Port used for communication with parent frame.
 */
function handleAppBannerShowing( calypsoPort ) {
	const isWelcomeGuideShown = select( 'automattic/wpcom-welcome-guide' ).isWelcomeGuideShown();
	if ( ! isWelcomeGuideShown ) {
		return;
	}

	const { port1, port2 } = new MessageChannel();
	calypsoPort.postMessage(
		{
			action: 'getIsAppBannerVisible',
			payload: {},
		},
		[ port2 ]
	);
	port1.onmessage = ( { data } ) => {
		const { isAppBannerVisible, hasAppBannerBeenDismissed } = data;
		if ( hasAppBannerBeenDismissed ) {
			dispatch( 'automattic/wpcom-welcome-guide' ).setShowWelcomeGuide( true, { onlyLocal: true } );
		} else if ( isAppBannerVisible ) {
			dispatch( 'automattic/wpcom-welcome-guide' ).setShowWelcomeGuide( false, {
				onlyLocal: true,
			} );
		}
	};
}

function handleWpAdminRedirect( { calypsoPort, path, title } ) {
	const selector = `[data-value="${ title }"]`;

	const callback = ( e ) => {
		e.preventDefault();

		calypsoPort.postMessage( {
			action: 'wpAdminRedirect',
			payload: {
				destinationUrl: `/wp-admin/${ path }`,
				unsavedChanges: select( 'core/editor' ).isEditedPostDirty(),
			},
		} );
	};

	addEditorListener( selector, callback );
	addCommandsInputListener( selector, callback );
}

function handlePatterns( calypsoPort ) {
	handleWpAdminRedirect( {
		calypsoPort,
		path: 'site-editor.php?postType=wp_block',
		title: __( 'Patterns' ),
	} );
}

function handleAddPage( calypsoPort ) {
	handleWpAdminRedirect( {
		calypsoPort,
		path: 'post-new.php?post_type=page',
		title: __( 'Add new page' ),
	} );
}

function handleAddPost( calypsoPort ) {
	handleWpAdminRedirect( { calypsoPort, path: 'post-new.php', title: __( 'Add new post' ) } );
}

async function handleWpTemplateCommands( calypsoPort ) {
	const callback = ( e, postType, postId ) => {
		e.preventDefault();

		calypsoPort.postMessage( {
			action: 'wpAdminRedirect',
			payload: {
				destinationUrl: `/wp-admin/site-editor.php?postType=${ postType }&postId=${ encodeURIComponent(
					postId
				) }&canvas=edit`,
				unsavedChanges: select( 'core/editor' ).isEditedPostDirty(),
			},
		} );
	};

	const entityNames = [ 'wp_template', 'wp_template_part' ];

	entityNames.forEach( async ( entityName ) => {
		const records = await getPostTypeRecords( entityName );

		records.forEach( ( record ) => {
			const selector = `[data-value$="${ record.id }"]`;
			addEditorListener( selector, ( e ) => callback( e, entityName, record.id ) );
			addCommandsInputListener( selector, ( e ) => callback( e, entityName, record.id ) );
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
			const mediaSelectChannel = new MessageChannel();
			const mediaCancelChannel = new MessageChannel();

			calypsoPort.postMessage(
				{
					action: 'openMediaModal',
					payload: {
						allowedTypes: this.props.allowedTypes,
						gallery: this.props.gallery,
						multiple: this.props.multiple,
						value: this.props.value,
					},
					ports: [ mediaSelectChannel.port2, mediaCancelChannel.port2 ],
				},
				[ mediaSelectChannel.port2, mediaCancelChannel.port2 ]
			);

			mediaSelectChannel.port1.onmessage = ( { data } ) => {
				this.props.onSelect?.( data );

				// this is a once-only port
				// to send more messages we have to re-open the
				// modal and create a new channel
				mediaSelectChannel.port1.close();
			};

			mediaCancelChannel.port1.onmessage = () => {
				this.props.onClose?.();

				// this is a once-only port
				// to send more messages we have to re-open the
				// modal and create a new channel
				mediaCancelChannel.port1.close();
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

		// handle post state change to locked (current user not editing)
		handlePostLocked( calypsoPort );

		// handle post lock state change to takeover
		handlePostLockTakeover( calypsoPort );

		handlePostStatusChange( calypsoPort );

		handleUpdateImageBlocks( calypsoPort );

		handleInsertClassicBlockMedia( calypsoPort );

		handleCloseEditor( calypsoPort );

		openLinksInParentFrame( calypsoPort );

		openCustomizer( calypsoPort );

		openTemplatePartLinks( calypsoPort );

		getCloseButtonUrl( calypsoPort );

		getGutenboardingStatus( calypsoPort );

		getNavSidebarLabels( calypsoPort );

		getCalypsoUrlInfo( calypsoPort );

		handleEditorLoaded( calypsoPort );

		handleCheckoutModal( calypsoPort );

		handleAppBannerShowing( calypsoPort );

		handlePatterns( calypsoPort );

		handleAddPage( calypsoPort );

		handleAddPost( calypsoPort );

		handleWpTemplateCommands( calypsoPort );
	}

	window.removeEventListener( 'message', initPort, false );
}

// Note: domReady is used instead of `(function() { ... })()` because certain
// things in `initPort` require other scripts to be loaded. (For example, ETK
// scripts need to be available before some things will work correctly.)
domReady( () => {
	window.addEventListener( 'message', initPort, false );

	//signal module loaded
	sendMessage( { action: 'loaded' } );
} );
