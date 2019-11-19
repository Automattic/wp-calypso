/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { find, isEmpty, reduce, get, keyBy, mapValues, partition, reject, sortBy } from 'lodash';
import classnames from 'classnames';
import '@wordpress/nux';
import { __, sprintf } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { Button, Modal, Spinner, IconButton } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { withDispatch, withSelect } from '@wordpress/data';
import { Component } from '@wordpress/element';
import { parse as parseBlocks } from '@wordpress/blocks';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
/**
 * Internal dependencies
 */
import './styles/starter-page-templates-editor.scss';
import TemplateSelectorControl from './components/template-selector-control';
import TemplateSelectorPreview from './components/template-selector-preview';
import { trackDismiss, trackSelection, trackView, initializeWithIdentity } from './utils/tracking';
import replacePlaceholders from './utils/replace-placeholders';
import ensureAssets from './utils/ensure-assets';
import SidebarTemplatesPlugin from './components/sidebar-modal-opener';
/* eslint-enable import/no-extraneous-dependencies */

const DEFAULT_HOMEPAGE_TEMPLATE = 'maywood';

// Load config passed from backend.
const {
	templates = [],
	vertical,
	segment,
	tracksUserData,
	siteInformation = {},
	screenAction,
	theme,
	isFrontPage,
} = window.starterPageTemplatesConfig;

class PageTemplateModal extends Component {
	state = {
		isLoading: false,
		previewedTemplate: null,
		blocksByTemplateSlug: {},
		titlesByTemplateSlug: {},
		error: null,
		isOpen: false,
	};

	constructor( props ) {
		super();
		const hasTemplates = ! isEmpty( props.templates );
		this.state.isOpen = hasTemplates;
		if ( hasTemplates ) {
			// Select the first template automatically.
			this.state.previewedTemplate = this.getDefaultSelectedTemplate( props );
			// Extract titles for faster lookup.
			this.state.titlesByTemplateSlug = mapValues( keyBy( props.templates, 'slug' ), 'title' );
		}
	}

	componentDidMount() {
		if ( this.state.isOpen ) {
			trackView( this.props.segment.id, this.props.vertical.id );
		}

		// Parse templates blocks and store them into the state.
		const blocksByTemplateSlug = reduce(
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
		this.setState( { blocksByTemplateSlug } );
	}

	getDefaultSelectedTemplate = props => {
		const blankTemplate = get( props.templates, [ 0, 'slug' ] );
		let previouslyChosenTemplate = props._starter_page_template;

		// Usally the "new page" case.
		if ( ! isFrontPage && ! previouslyChosenTemplate ) {
			return blankTemplate;
		}

		// Normalize "home" slug into the current theme.
		if ( previouslyChosenTemplate === 'home' ) {
			previouslyChosenTemplate = theme;
		}

		const slug = previouslyChosenTemplate || theme;

		if ( find( props.templates, { slug } ) ) {
			return slug;
		} else if ( find( props.templates, { slug: DEFAULT_HOMEPAGE_TEMPLATE } ) ) {
			return DEFAULT_HOMEPAGE_TEMPLATE;
		}
		return blankTemplate;
	};

	setTemplate = slug => {
		// Track selection and mark post as using a template in its postmeta.
		trackSelection( this.props.segment.id, this.props.vertical.id, slug );
		this.props.saveTemplateChoice( slug );

		const isHomepageTemplate = find( this.props.templates, { slug, category: 'home' } );

		// Load content.
		const blocks = this.getBlocksByTemplateSlug( slug );
		// Only overwrite the page title if the template is not one of the Homepage Layouts
		const title = isHomepageTemplate ? null : this.getTitleByTemplateSlug( slug );

		// Skip inserting if there's nothing to insert.
		if ( ! blocks || ! blocks.length ) {
			this.setState( { isOpen: false } );
			return;
		}

		// Show loading state.
		this.setState( {
			error: null,
			isLoading: true,
		} );

		// Make sure all blocks use local assets before inserting.
		this.maybePrefetchAssets( blocks )
			.then( blocksWithAssets => {
				// Don't insert anything if the user clicked Cancel/Close
				// before we loaded everything.
				if ( ! this.state.isOpen ) {
					return;
				}

				this.props.insertTemplate( title, blocksWithAssets );
				this.setState( { isOpen: false } );
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

	handleConfirmation = slug => {
		if ( typeof slug !== 'string' ) {
			slug = this.state.previewedTemplate;
		}

		this.setTemplate( slug );

		// Turn off sidebar's instance of modal
		if ( this.props.isPromptedFromSidebar ) {
			this.props.toggleTemplateModal();
		}
	};

	previewTemplate = slug => this.setState( { previewedTemplate: slug } );

	closeModal = event => {
		// Check to see if the Blur event occurred on the buttons inside of the Modal.
		// If it did then we don't want to dismiss the Modal for this type of Blur.
		if ( event.target.matches( 'button.template-selector-item__label' ) ) {
			return false;
		}

		trackDismiss( this.props.segment.id, this.props.vertical.id );

		// Try if we have specific URL to go back to, otherwise go to the page list.
		const calypsoifyCloseUrl = get( window, [ 'calypsoifyGutenberg', 'closeUrl' ] );
		window.top.location = calypsoifyCloseUrl || 'edit.php?post_type=page';
	};

	getBlocksByTemplateSlug( slug ) {
		return get( this.state.blocksByTemplateSlug, [ slug ], [] );
	}

	getTitleByTemplateSlug( slug ) {
		return get( this.state.titlesByTemplateSlug, [ slug ], '' );
	}

	getTemplateGroups = () => {
		const [ homepageTemplates, defaultTemplates ] = partition( this.props.templates, {
			category: 'home',
		} );

		const currentThemeTemplate =
			find( this.props.templates, { slug: theme } ) ||
			find( this.props.templates, { slug: DEFAULT_HOMEPAGE_TEMPLATE } );

		if ( ! isFrontPage || ! currentThemeTemplate ) {
			return { homepageTemplates: sortBy( homepageTemplates, 'title' ), defaultTemplates };
		}

		const otherHomepageTemplates = reject( homepageTemplates, { slug: currentThemeTemplate.slug } );

		const sortedHomepageTemplates = [
			currentThemeTemplate,
			...sortBy( otherHomepageTemplates, 'title' ),
		];

		return { homepageTemplates: sortedHomepageTemplates, defaultTemplates };
	};

	renderTemplatesList = ( templatesList, legendLabel ) => (
		<fieldset className="page-template-modal__list">
			<legend className="page-template-modal__form-title">{ legendLabel }</legend>
			<TemplateSelectorControl
				label={ __( 'Layout', 'full-site-editing' ) }
				templates={ templatesList }
				blocksByTemplates={ this.state.blocksByTemplateSlug }
				onTemplateSelect={ this.previewTemplate }
				useDynamicPreview={ false }
				siteInformation={ siteInformation }
				selectedTemplate={ this.state.previewedTemplate }
				handleTemplateConfirmation={ this.handleConfirmation }
			/>
		</fieldset>
	);

	render() {
		const { previewedTemplate, isOpen, isLoading } = this.state;
		const { isPromptedFromSidebar } = this.props;

		if ( ! isOpen ) {
			return null;
		}

		const { homepageTemplates, defaultTemplates } = this.getTemplateGroups();

		return (
			<Modal
				title={ __( 'Select Page Layout', 'full-site-editing' ) }
				className="page-template-modal"
				overlayClassName="page-template-modal-screen-overlay"
				shouldCloseOnClickOutside={ false }
				// Using both variants here to be compatible with new Gutenberg and old (older than 6.6).
				isDismissable={ false }
				isDismissible={ false }
			>
				{ isPromptedFromSidebar ? (
					<IconButton
						className="page-template-modal__close-button components-icon-button"
						onClick={ this.props.toggleTemplateModal }
						icon="no-alt"
						label={ __( 'Close Layout Selector' ) }
					/>
				) : (
					<IconButton
						className="page-template-modal__close-button components-icon-button"
						onClick={ this.closeModal }
						icon="arrow-left-alt2"
						label={ __( 'Go back' ) }
					/>
				) }

				<div className="page-template-modal__inner">
					{ isLoading ? (
						<div className="page-template-modal__loading">
							<Spinner />
							{ __( 'Adding layout…', 'full-site-editing' ) }
						</div>
					) : (
						<>
							<form className="page-template-modal__form">
								{ isFrontPage ? (
									<>
										{ this.renderTemplatesList(
											homepageTemplates,
											__( 'Recommended Layouts', 'full-site-editing' )
										) }
										{ this.renderTemplatesList(
											defaultTemplates,
											__( 'Other Page Layouts', 'full-site-editing' )
										) }
									</>
								) : (
									<>
										{ this.renderTemplatesList(
											defaultTemplates,
											__( 'Recommended Layouts', 'full-site-editing' )
										) }
										{ this.renderTemplatesList(
											homepageTemplates,
											__( 'Homepage Layouts', 'full-site-editing' )
										) }
									</>
								) }
							</form>
							<TemplateSelectorPreview
								blocks={ this.getBlocksByTemplateSlug( previewedTemplate ) }
								viewportWidth={ 960 }
								title={ this.getTitleByTemplateSlug( previewedTemplate ) }
							/>
						</>
					) }
				</div>
				<div
					className={ classnames( 'page-template-modal__buttons', {
						'is-visually-hidden': isEmpty( previewedTemplate ) || isLoading,
					} ) }
				>
					<Button
						isPrimary
						isLarge
						disabled={ isEmpty( previewedTemplate ) || isLoading }
						onClick={ this.handleConfirmation }
					>
						{ sprintf(
							__( 'Use %s layout', 'full-site-editing' ),
							this.getTitleByTemplateSlug( previewedTemplate )
						) }
					</Button>
				</div>
			</Modal>
		);
	}
}

export const PageTemplatesPlugin = compose(
	withSelect( select => {
		const getMeta = () => select( 'core/editor' ).getEditedPostAttribute( 'meta' );
		const { _starter_page_template } = getMeta();
		return {
			getMeta,
			_starter_page_template,
			postContentBlock: select( 'core/editor' )
				.getBlocks()
				.find( block => block.name === 'a8c/post-content' ),
		};
	} ),
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
				if ( title ) {
					editorDispatcher.editPost( { title } );
				}

				// Replace blocks.
				const postContentBlock = ownProps.postContentBlock;
				dispatch( 'core/block-editor' ).replaceInnerBlocks(
					postContentBlock ? postContentBlock.clientId : '',
					blocks,
					false
				);
			},
		};
	} )
)( PageTemplateModal );

if ( tracksUserData ) {
	initializeWithIdentity( tracksUserData );
}

// Open plugin only if we are creating new page.
if ( screenAction === 'add' ) {
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
}

// Always register ability to open from document sidebar.
registerPlugin( 'page-templates-sidebar', {
	render: () => {
		return (
			<PluginDocumentSettingPanel
				name="Template Modal Opener"
				title={ __( 'Page Layout' ) }
				className="page-template-modal__sidebar"
				icon="admin-page"
			>
				<SidebarTemplatesPlugin
					templates={ templates }
					vertical={ vertical }
					segment={ segment }
					siteInformation={ siteInformation }
				/>
			</PluginDocumentSettingPanel>
		);
	},
} );
