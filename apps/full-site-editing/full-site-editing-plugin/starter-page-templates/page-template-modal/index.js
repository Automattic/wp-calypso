/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { Modal } from '@wordpress/components';
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

	selectTemplate = ( slug, title, blocks ) => {
		this.setState( { isOpen: false } );
		trackSelection( this.props.segment.id, this.props.vertical.id, slug );

		this.props.saveTemplateChoice( slug );

		// Skip inserting if there's nothing to insert.
		if ( blocks.length === 0 ) {
			return;
		}

		this.props.insertTemplate( title, blocks );
	};

	focusTemplate = ( slug, title, previewBlocks ) => {
		this.setState( { previewBlocks } );
	};

	closeModal = () => {
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
								onTemplateSelect={ ( slug, title, blocks ) =>
									this.selectTemplate( slug, title, blocks )
								}
								onTemplateFocus={ ( slug, title, blocks ) =>
									this.focusTemplate( slug, title, blocks )
								}
								dynamicPreview={ true }
							/>
						</fieldset>
					</form>
					<TemplateSelectorPreview blocks={ this.state.previewBlocks } viewportWidth={ 800 } />
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
