/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
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

class PageTemplateModal extends Component {
	state = {
		isLoading: false,
		previewBlocks: [],
		slug: '',
		title: '',
	};

	constructor( props ) {
		// eslint-disable-next-line no-console
		console.time( 'PageTemplateModal' );
		super();
		this.state.isOpen = ! isEmpty( props.templates );
	}

	componentDidMount() {
		if ( this.state.isOpen ) {
			trackView( this.props.segment.id, this.props.vertical.id );
		}
		// eslint-disable-next-line no-console
		console.timeEnd( 'PageTemplateModal' );
	}

	setTemplate = ( slug, title, previewBlocks ) => {
		this.setState( { isOpen: false } );
		trackSelection( this.props.segment.id, this.props.vertical.id, slug );

		this.props.saveTemplateChoice( slug );

		// Skip inserting if there's nothing to insert.
		if ( previewBlocks.length === 0 ) {
			return;
		}

		this.props.insertTemplate( title, previewBlocks );
	};

	selectTemplate = () =>
		this.setTemplate( this.state.slug, this.state.title, this.state.previewBlocks );

	focusTemplate = ( slug, title, previewBlocks ) => {
		this.setState( { slug, title, previewBlocks } );
		if ( slug === 'blank' ) {
			this.setTemplate( slug, title, previewBlocks );
		}
	};

	closeModal = event => {
		// Check to see if the Blur event occured on the buttons inside of the Modal.
		// If it did then we don't want to dismiss the Modal for this type of Blur.
		if ( event.target.matches( 'button.template-selector-item__label' ) ) {
			return false;
		}
		this.setState( { isOpen: false } );
		trackDismiss( this.props.segment.id, this.props.vertical.id );
	};

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
								onTemplateSelect={ this.focusTemplate }
								// onTemplateFocus={ this.focusTemplate }
								useDynamicPreview={ true }
								numBlocksInPreview={ 10 }
							/>
						</fieldset>
					</form>
					<TemplateSelectorPreview blocks={ this.state.previewBlocks } viewportWidth={ 960 } />
				</div>
				<div className="page-template-modal__buttons">
					<Button isDefault isLarge onClick={ this.closeModal }>
						{ __( 'Cancel', 'full-site-editing' ) }
					</Button>
					<Button
						isPrimary
						isLarge
						disabled={ isEmpty( this.state.slug ) }
						onClick={ this.selectTemplate }
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
