/**
 * External dependencies
 */
import { isEmpty, reduce } from 'lodash';
import { __, sprintf } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { Button, Modal, Spinner } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { withDispatch, withSelect } from '@wordpress/data';
import { Component } from '@wordpress/element';
import ensureAssets from './utils/ensure-assets';
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
		error: null,
		isOpen: false,
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

	setBeforeInsertTemplate = ( slug, title, blocks ) => {
		this.props.saveTemplateChoice( slug );
		this.props.insertTemplate( title, blocks );
		this.setState( { isOpen: false } );
	};

	setTemplate = ( slug, title ) => {
		this.setState( {
			error: null,
			isLoading: true,
		} );

		trackSelection( this.props.segment.id, this.props.vertical.id, slug );

		const blocks = this.state.blocks[ slug ];

		// Do not prefetch for `blank` template.
		if ( 'blank' === slug ) {
			return this.setBeforeInsertTemplate( slug, title, blocks );
		}

		// Skip inserting if there's nothing to insert.
		if ( ! blocks || ! blocks.length ) {
			return;
		}

		// Make sure all blocks use local assets before inserting.
		this.maybePrefetchAssets( blocks )
			.then( blocksWithAssets => {
				// Don't insert anything if the user clicked Cancel/Close
				// before we loaded everything.
				if ( ! this.state.isOpen ) {
					return;
				}

				this.setBeforeInsertTemplate( slug, title, blocksWithAssets );
			} )
			.catch( error => {
				this.setState( {
					isLoading: false,
					error,
				} );
			} );
	};

	maybePrefetchAssets = blocks => {
		return this.props.shouldPrefetchAssets ? ensureAssets( blocks ) : Promise.resolve( blocks );
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
					{ this.state.isLoading ? (
						<div className="page-template-modal__loading">
							<Spinner />
							{ __( 'Inserting template…', 'full-site-editing' ) }
						</div>
					) : (
						<>
							<form className="page-template-modal__form">
								<fieldset className="page-template-modal__list">
									<TemplateSelectorControl
										label={ __( 'Template', 'full-site-editing' ) }
										templates={ this.props.templates }
										blocksByTemplates={ this.state.blocks }
										onTemplateSelect={ this.previewTemplate }
										useDynamicPreview={ false }
										siteInformation={ siteInformation }
									/>
								</fieldset>
							</form>
							<TemplateSelectorPreview
								blocks={ this.getBlocksByTemplateSlug() }
								viewportWidth={ 960 }
								title={ this.state.title }
							/>
						</>
					) }
				</div>
				<div className="page-template-modal__buttons">
					<Button isDefault isLarge onClick={ this.closeModal }>
						{ __( 'Cancel', 'full-site-editing' ) }
					</Button>
					<Button
						isPrimary
						isLarge
						disabled={ isEmpty( this.state.slug ) || this.state.isLoading }
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
			<PageTemplatesPlugin
				shouldPrefetchAssets={ false }
				templates={ templates }
				vertical={ vertical }
				segment={ segment }
			/>
		);
	},
} );
