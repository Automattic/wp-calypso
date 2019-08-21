/**
 * External dependencies
 */
import { isEmpty, reduce } from 'lodash';
import { __, sprintf } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { Button, Modal } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { withDispatch, withSelect } from '@wordpress/data';
import { useState, useMemo, useEffect } from '@wordpress/element';
import '@wordpress/nux';

/**
 * Internal dependencies
 */
import './styles/starter-page-templates-editor.scss';
import TemplateSelectorControl from './components/template-selector-control';
import TemplateSelectorPreview from './components/template-selector-preview';
import { trackDismiss, trackSelection, trackView, initializeWithIdentity } from './utils/tracking';
import { parse as parseBlocks } from '@wordpress/blocks';
import replacePlaceholders from './utils/replace-placeholders';

// Load config passed from backend.
const { siteInformation = {} } = window.starterPageTemplatesConfig;

const PageTemplateModal = ( {
	templates,
	segment,
	vertical,
	saveTemplateChoice,
	insertTemplate,
} ) => {
	const [ isOpen, setIsOpen ] = useState( ! isEmpty( templates ) );
	const [ slug, setSlug ] = useState( '' );
	const [ title, setTitle ] = useState( '' );

	const blocks = useMemo(
		() =>
			reduce(
				templates,
				( prev, tpl ) => {
					prev[ tpl.slug ] = tpl.content
						? parseBlocks( replacePlaceholders( tpl.content, siteInformation ) )
						: [];
					return prev;
				},
				{}
			),
		[ templates ]
	);

	useEffect( () => {
		if ( isOpen ) {
			trackView( segment.id, vertical.id );
		}
	}, [ isOpen, segment.id, vertical.id ] );

	const getBlocksByTemplateSlug = ( templateSlug = slug ) => {
		if ( ! templateSlug ) {
			return [];
		}

		if ( ! blocks.hasOwnProperty( templateSlug ) ) {
			return [];
		}

		return blocks[ templateSlug ];
	};

	const setTemplate = ( templateSlug, templateTitle ) => {
		setIsOpen( false );
		trackSelection( segment.id, vertical.id, templateSlug );

		saveTemplateChoice( templateSlug );

		const previewBlocks = getBlocksByTemplateSlug( templateSlug );

		// Skip inserting if there's nothing to insert.
		if ( ! previewBlocks || ! previewBlocks.length ) {
			return;
		}

		insertTemplate( templateTitle, previewBlocks );
	};

	const handleConfirmation = () => setTemplate( slug, title );

	const previewTemplate = ( templateSlug, templateTitle ) => {
		setSlug( templateSlug );
		setTitle( templateTitle );

		if ( templateSlug === 'blank' ) {
			setTemplate( templateSlug, templateTitle );
		}
	};

	const closeModal = event => {
		// Check to see if the Blur event occurred on the buttons inside of the Modal.
		// If it did then we don't want to dismiss the Modal for this type of Blur.
		if ( event.target.matches( 'button.template-selector-item__label' ) ) {
			return false;
		}
		setIsOpen( false );
		trackDismiss( segment.id, vertical.id );
	};

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			title={ __( 'Select Page Template', 'full-site-editing' ) }
			onRequestClose={ closeModal }
			className="page-template-modal"
			overlayClassName="page-template-modal-screen-overlay"
		>
			<div className="page-template-modal__inner">
				<form className="page-template-modal__form">
					<fieldset className="page-template-modal__list">
						<TemplateSelectorControl
							label={ __( 'Template', 'full-site-editing' ) }
							templates={ templates }
							blocksByTemplates={ blocks }
							onTemplateSelect={ previewTemplate }
							useDynamicPreview={ true }
						/>
					</fieldset>
				</form>
				<TemplateSelectorPreview blocks={ getBlocksByTemplateSlug( slug ) } viewportWidth={ 960 } />
			</div>
			<div className="page-template-modal__buttons">
				<Button isDefault isLarge onClick={ closeModal }>
					{ __( 'Cancel', 'full-site-editing' ) }
				</Button>
				<Button isPrimary isLarge disabled={ isEmpty( slug ) } onClick={ handleConfirmation }>
					{ sprintf( __( 'Use %s template', 'full-site-editing' ), title ) }
				</Button>
			</div>
		</Modal>
	);
};

const PageTemplatesPlugin = compose(
	withSelect( select => ( {
		getMeta: () => select( 'core/editor' ).getEditedPostAttribute( 'meta' ),
		postContentBlock: select( 'core/editor' )
			.getBlocks()
			.find( block => block.name === 'a8c/post-content' ),
	} ) ),
	withDispatch( ( dispatch, ownProps ) => {
		// Disable tips right away as the collide with the modal window.
		dispatch( 'core/nux' ).disableTips();

		const editorDispatcher = dispatch( 'core/editor' );
		return {
			saveTemplateChoice: slug => {
				// Save selected template slug in meta.
				const currentMeta = ownProps.getMeta();
				editorDispatcher.editPost( {
					meta: {
						...currentMeta,
						_starter_page_template: slug,
					},
				} );
			},
			insertTemplate: ( title, blocks ) => {
				// Set post title.
				editorDispatcher.editPost( { title } );

				// Insert blocks.
				const postContentBlock = ownProps.postContentBlock;
				editorDispatcher.insertBlocks(
					blocks,
					0,
					postContentBlock ? postContentBlock.clientId : '',
					false
				);
			},
		};
	} )
)( PageTemplateModal );

// Load config passed from backend.
const { templates = [], vertical, segment, tracksUserData } = window.starterPageTemplatesConfig;

if ( tracksUserData ) {
	initializeWithIdentity( tracksUserData );
}

registerPlugin( 'page-templates', {
	render: () => {
		return (
			<PageTemplatesPlugin templates={ templates } vertical={ vertical } segment={ segment } />
		);
	},
} );
