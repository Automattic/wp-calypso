/**
 * External dependencies
 */
import { isEmpty, reduce } from 'lodash';
import { __, sprintf } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { Button, Modal } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { withDispatch, withSelect } from '@wordpress/data';
import { Component } from '@wordpress/element';
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
const {
	templates = [],
	vertical,
	segment,
	tracksUserData,
	siteInformation = {},
} = window.starterPageTemplatesConfig;

class PageTemplateModal extends Component {
	state = {
		isLoading: false,
		slug: '',
		title: '',
		blocks: {},
	};

	constructor( props ) {
		super();
		this.state.isOpen = ! isEmpty( props.templates );
	}

	componentDidMount() {
		if ( this.state.isOpen ) {
			trackView( this.props.segment.id, this.props.vertical.id );
		}

		// Parse templates blocks and store them into the state.
		const blocks = reduce(
			templates,
			( prev, { slug, content } ) => {
				prev[ slug ] = content
					? parseBlocks( replacePlaceholders( content, siteInformation ) )
					: [];
				return prev;
			},
			{}
		);

		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState( { blocks } );
	}

	setTemplate = ( slug, title ) => {
		this.setState( { isOpen: false } );
		trackSelection( this.props.segment.id, this.props.vertical.id, slug );

		this.props.saveTemplateChoice( slug );

		const previewBlocks = this.state.blocks[ slug ];

		// Skip inserting if there's nothing to insert.
		if ( ! previewBlocks || ! previewBlocks.length ) {
			return;
		}

		this.props.insertTemplate( title, previewBlocks );
	};

	handleConfirmation = () => this.setTemplate( this.state.slug, this.state.title );

	previewTemplate = ( slug, title ) => {
		this.setState( { slug, title } );
		if ( slug === 'blank' ) {
			this.setTemplate( slug, title );
		}
	};

	closeModal = event => {
		// Check to see if the Blur event occurred on the buttons inside of the Modal.
		// If it did then we don't want to dismiss the Modal for this type of Blur.
		if ( event.target.matches( 'button.template-selector-item__label' ) ) {
			return false;
		}
		this.setState( { isOpen: false } );
		trackDismiss( this.props.segment.id, this.props.vertical.id );
	};

	getBlocksByTemplateSlug( slug = this.state.slug ) {
		if ( ! slug ) {
			return [];
		}

		if ( ! this.state.blocks.hasOwnProperty( slug ) ) {
			return [];
		}

		return this.state.blocks[ slug ];
	}

	render() {
		if ( ! this.state.isOpen ) {
			return null;
		}

		return (
			<Modal
				title={ __( 'Select Page Template', 'full-site-editing' ) }
				onRequestClose={ this.closeModal }
				className="page-template-modal"
				overlayClassName="page-template-modal-screen-overlay"
			>
				<div className="page-template-modal__inner">
					<form className="page-template-modal__form">
						<fieldset className="page-template-modal__list">
							<TemplateSelectorControl
								label={ __( 'Template', 'full-site-editing' ) }
								templates={ this.props.templates }
								blocksByTemplates={ this.state.blocks }
								onTemplateSelect={ this.previewTemplate }
								useDynamicPreview={ true }
								siteInformation={ siteInformation }
							/>
						</fieldset>
					</form>
					<TemplateSelectorPreview
						blocks={ this.getBlocksByTemplateSlug() }
						viewportWidth={ 960 }
					/>
				</div>
				<div className="page-template-modal__buttons">
					<Button isDefault isLarge onClick={ this.closeModal }>
						{ __( 'Cancel', 'full-site-editing' ) }
					</Button>
					<Button
						isPrimary
						isLarge
						disabled={ isEmpty( this.state.slug ) }
						onClick={ this.handleConfirmation }
					>
						{ sprintf( __( 'Use %s template', 'full-site-editing' ), this.state.title ) }
					</Button>
				</div>
			</Modal>
		);
	}
}

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
