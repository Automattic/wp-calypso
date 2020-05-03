/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import {
	find,
	isEmpty,
	reduce,
	get,
	keyBy,
	mapValues,
	memoize,
	filter,
	sortBy,
	stubTrue,
} from 'lodash';
import classnames from 'classnames';
import '@wordpress/nux';
import { __, sprintf } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { Button, Modal, Spinner, IconButton } from '@wordpress/components';
import { withDispatch, withSelect } from '@wordpress/data';
import { Component } from '@wordpress/element';
import { parse as parseBlocks } from '@wordpress/blocks';
import { addFilter, removeFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import './styles/starter-page-templates-editor.scss';
import TemplateSelectorControl from './components/template-selector-control';
import TemplateSelectorPreview from './components/template-selector-preview';
import { trackDismiss, trackSelection, trackView } from './utils/tracking';
import replacePlaceholders from './utils/replace-placeholders';
import ensureAssets from './utils/ensure-assets';
import mapBlocksRecursively from './utils/map-blocks-recursively';
import containsMissingBlock from './utils/contains-missing-block';
/* eslint-enable import/no-extraneous-dependencies */

const DEFAULT_HOMEPAGE_TEMPLATE = 'maywood';
const INSERTING_HOOK_NAME = 'isInsertingPageTemplate';
const INSERTING_HOOK_NAMESPACE = 'automattic/full-site-editing/inserting-template';

class PageTemplateModal extends Component {
	state = {
		isLoading: false,
		previewedTemplate: null,
		error: null,
	};

	// Extract titles for faster lookup.
	getTitlesByTemplateSlugs = memoize( ( templates ) =>
		mapValues( keyBy( templates, 'slug' ), 'title' )
	);

	// Parse templates blocks and memoize them.
	getBlocksByTemplateSlugs = memoize( ( templates ) => {
		const blocksByTemplateSlugs = reduce(
			templates,
			( prev, { slug, content } ) => {
				prev[ slug ] = content
					? parseBlocks( replacePlaceholders( content, this.props.siteInformation ) )
					: [];
				return prev;
			},
			{}
		);

		// Remove templates that include a missing block
		return this.filterTemplatesWithMissingBlocks( blocksByTemplateSlugs );
	} );

	filterTemplatesWithMissingBlocks( templates ) {
		return reduce(
			templates,
			( acc, templateBlocks, slug ) => {
				// Does the template contain any missing blocks?
				const templateHasMissingBlocks = containsMissingBlock( templateBlocks );

				// Only retain the template in the collection if:
				// 1. It does not contain any missing blocks
				// 2. There are no blocks at all (likely the "blank" template placeholder)
				if ( ! templateHasMissingBlocks || ! templateBlocks.length ) {
					acc[ slug ] = templateBlocks;
				}

				return acc;
			},
			{}
		);
	}

	getBlocksForPreview = memoize( ( previewedTemplate ) => {
		const blocks = this.getBlocksByTemplateSlug( previewedTemplate );

		// Modify the existing blocks returning new block object references.
		return mapBlocksRecursively( blocks, function modifyBlocksForPreview( block ) {
			// `jetpack/contact-form` has a placeholder to configure form settings
			// we need to disable this to show the full form in the preview
			if (
				'jetpack/contact-form' === block.name &&
				undefined !== block.attributes.hasFormSettingsSet
			) {
				block.attributes.hasFormSettingsSet = true;
			}

			return block;
		} );
	} );

	getBlocksForSelection = ( selectedTemplate ) => {
		const blocks = this.getBlocksByTemplateSlug( selectedTemplate );
		// Modify the existing blocks returning new block object references.
		return mapBlocksRecursively( blocks, function modifyBlocksForSelection( block ) {
			// Ensure that core/button doesn't link to external template site
			if ( 'core/button' === block.name && undefined !== block.attributes.url ) {
				block.attributes.url = '#';
			}

			return block;
		} );
	};

	static getDerivedStateFromProps( props, state ) {
		// The only time `state.previewedTemplate` isn't set is before `templates`
		// are loaded. As soon as we have our `templates`, we set it using
		// `this.getDefaultSelectedTemplate`. Afterwards, the user can select a
		// different template, but can never un-select it.
		// This makes it a reliable indicator for whether the modal has just been launched.
		// It's also possible that `templates` are present during initial mount, in which
		// case this will be called before `componentDidMount`, which is also fine.
		if ( ! state.previewedTemplate && ! isEmpty( props.templates ) ) {
			// Show the modal, and select the first template automatically.
			return {
				previewedTemplate: PageTemplateModal.getDefaultSelectedTemplate( props ),
			};
		}
		return null;
	}

	componentDidMount() {
		if ( this.props.isOpen ) {
			this.trackCurrentView();
		}
	}

	componentDidUpdate( prevProps ) {
		// Only track when the modal is first displayed
		// and if it didn't already happen during componentDidMount.
		if ( ! prevProps.isOpen && this.props.isOpen ) {
			this.trackCurrentView();
		}

		// Disable welcome guide right away as it collides with the modal window.
		if ( this.props.isWelcomeGuideActive || this.props.areTipsEnabled ) {
			this.props.hideWelcomeGuide();
		}
	}

	trackCurrentView() {
		trackView(
			this.props.segment.id,
			this.props.vertical.id,
			this.props.isPromptedFromSidebar ? 'sidebar' : 'add-page'
		);
	}

	static getDefaultSelectedTemplate = ( props ) => {
		const blankTemplate = get( props.templates, [ 0, 'slug' ] );
		let previouslyChosenTemplate = props._starter_page_template;

		// Usally the "new page" case
		if ( ! props.isFrontPage && ! previouslyChosenTemplate ) {
			return blankTemplate;
		}

		// Normalize "home" slug into the current theme.
		if ( previouslyChosenTemplate === 'home' ) {
			previouslyChosenTemplate = props.theme;
		}

		const slug = previouslyChosenTemplate || props.theme;

		if ( find( props.templates, { slug } ) ) {
			return slug;
		} else if ( find( props.templates, { slug: DEFAULT_HOMEPAGE_TEMPLATE } ) ) {
			return DEFAULT_HOMEPAGE_TEMPLATE;
		}
		return blankTemplate;
	};

	setTemplate = ( slug ) => {
		// Track selection and mark post as using a template in its postmeta.
		trackSelection( this.props.segment.id, this.props.vertical.id, slug );
		this.props.saveTemplateChoice( slug );

		// Check to see if this is a blank template selection
		// and reset the template if so.
		if ( 'blank' === slug ) {
			this.props.insertTemplate( '', [] );
			this.props.setIsOpen( false );
			return;
		}

		const isHomepageTemplate = find( this.props.templates, { slug, category: 'home' } );

		// Load content.
		const blocks = this.getBlocksForSelection( slug );

		// Only overwrite the page title if the template is not one of the Homepage Layouts
		const title = isHomepageTemplate ? null : this.getTitleByTemplateSlug( slug );

		// Skip inserting if this is not a blank template
		// and there's nothing to insert.
		if ( ! blocks || ! blocks.length ) {
			this.props.setIsOpen( false );
			return;
		}

		// Show loading state.
		this.setState( {
			error: null,
			isLoading: true,
		} );

		// Make sure all blocks use local assets before inserting.
		this.maybePrefetchAssets( blocks )
			.then( ( blocksWithAssets ) => {
				this.setState( { isLoading: false } );
				// Don't insert anything if the user clicked Cancel/Close
				// before we loaded everything.
				if ( ! this.props.isOpen ) {
					return;
				}

				this.props.insertTemplate( title, blocksWithAssets );
				this.props.setIsOpen( false );
			} )
			.catch( ( error ) => {
				this.setState( {
					isLoading: false,
					error,
				} );
			} );
	};

	maybePrefetchAssets = ( blocks ) => {
		return this.props.shouldPrefetchAssets ? ensureAssets( blocks ) : Promise.resolve( blocks );
	};

	handleConfirmation = ( slug ) => {
		if ( typeof slug !== 'string' ) {
			slug = this.state.previewedTemplate;
		}

		this.setTemplate( slug );

		// Turn off sidebar's instance of modal
		if ( this.props.isPromptedFromSidebar ) {
			this.props.toggleTemplateModal();
		}
	};

	previewTemplate = ( slug ) => {
		this.setState( { previewedTemplate: slug } );

		/**
		 * Determines (based on whether the large preview is able to be visible at the
		 * current breakpoint) whether or not the Template selection UI interaction model
		 * should be select _and_ confirm or simply a single "tap to confirm".
		 */
		const largeTplPreviewVisible = window.matchMedia( '(min-width: 660px)' ).matches;
		// Confirm the template when large preview isn't visible
		if ( ! largeTplPreviewVisible ) {
			this.handleConfirmation( slug );
		}
	};

	closeModal = ( event ) => {
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
		return get( this.getBlocksByTemplateSlugs( this.props.templates ), [ slug ], [] );
	}

	getTitleByTemplateSlug( slug ) {
		return get( this.getTitlesByTemplateSlugs( this.props.templates ), [ slug ], '' );
	}

	getTemplateGroups = () => {
		return {
			blankTemplate: filter( this.props.templates, { slug: 'blank' } ),
			aboutTemplates: filter( this.props.templates, { category: 'about' } ),
			blogTemplates: filter( this.props.templates, { category: 'blog' } ),
			contactTemplates: filter( this.props.templates, { category: 'contact' } ),
			eventTemplates: filter( this.props.templates, { category: 'event' } ),
			menuTemplates: filter( this.props.templates, { category: 'menu' } ),
			portfolioTemplates: filter( this.props.templates, { category: 'portfolio' } ),
			productTemplates: filter( this.props.templates, { category: 'product' } ),
			servicesTemplates: filter( this.props.templates, { category: 'services' } ),
			teamTemplates: filter( this.props.templates, { category: 'team' } ),
			homepageTemplates: sortBy( filter( this.props.templates, { category: 'home' } ), 'title' ),
		};
	};

	renderTemplatesList = ( templatesList, legendLabel ) => {
		if ( ! templatesList.length ) {
			return null;
		}

		// The raw `templates` prop is not filtered to remove Templates that
		// contain missing Blocks. Therefore we compare with the keys of the
		// filtered templates from `getBlocksByTemplateSlugs()` and filter this
		// list to match. This ensures that the list of Template thumbnails is
		// filtered so that it does not include Templates that have missing Blocks.
		const blocksByTemplateSlug = this.getBlocksByTemplateSlugs( this.props.templates );
		const templatesWithoutMissingBlocks = Object.keys( blocksByTemplateSlug );

		const filterOutTemplatesWithMissingBlocks = ( templatesToFilter, filterIn ) => {
			return templatesToFilter.filter( ( template ) => filterIn.includes( template.slug ) );
		};

		const filteredTemplatesList = filterOutTemplatesWithMissingBlocks(
			templatesList,
			templatesWithoutMissingBlocks
		);

		if ( ! filteredTemplatesList.length ) {
			return null;
		}

		return (
			<fieldset className="page-template-modal__list">
				<legend className="page-template-modal__form-title">{ legendLabel }</legend>
				<TemplateSelectorControl
					label={ __( 'Layout', 'full-site-editing' ) }
					templates={ filteredTemplatesList }
					blocksByTemplates={ blocksByTemplateSlug }
					onTemplateSelect={ this.previewTemplate }
					useDynamicPreview={ false }
					siteInformation={ this.props.siteInformation }
					selectedTemplate={ this.state.previewedTemplate }
				/>
			</fieldset>
		);
	};

	render() {
		const { previewedTemplate, isLoading } = this.state;
		const { isPromptedFromSidebar, hidePageTitle, isOpen } = this.props;

		if ( ! isOpen ) {
			return null;
		}

		const {
			blankTemplate,
			aboutTemplates,
			blogTemplates,
			contactTemplates,
			eventTemplates,
			menuTemplates,
			portfolioTemplates,
			productTemplates,
			servicesTemplates,
			teamTemplates,
			homepageTemplates,
		} = this.getTemplateGroups();

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
								{ this.props.isFrontPage &&
									this.renderTemplatesList(
										homepageTemplates,
										__( 'Home Pages', 'full-site-editing' )
									) }

								{ this.renderTemplatesList( blankTemplate, __( 'Blank', 'full-site-editing' ) ) }

								{ this.renderTemplatesList(
									aboutTemplates,
									__( 'About Pages', 'full-site-editing' )
								) }

								{ this.renderTemplatesList(
									blogTemplates,
									__( 'Blog Pages', 'full-site-editing' )
								) }

								{ this.renderTemplatesList(
									contactTemplates,
									__( 'Contact Pages', 'full-site-editing' )
								) }

								{ this.renderTemplatesList(
									eventTemplates,
									__( 'Event Pages', 'full-site-editing' )
								) }

								{ this.renderTemplatesList(
									menuTemplates,
									__( 'Menu Pages', 'full-site-editing' )
								) }

								{ this.renderTemplatesList(
									portfolioTemplates,
									__( 'Portfolio Pages', 'full-site-editing' )
								) }

								{ this.renderTemplatesList(
									productTemplates,
									__( 'Product Pages', 'full-site-editing' )
								) }

								{ this.renderTemplatesList(
									servicesTemplates,
									__( 'Services Pages', 'full-site-editing' )
								) }

								{ this.renderTemplatesList(
									teamTemplates,
									__( 'Team Pages', 'full-site-editing' )
								) }

								{ ! this.props.isFrontPage &&
									this.renderTemplatesList(
										homepageTemplates,
										__( 'Home Pages', 'full-site-editing' )
									) }
							</form>
							<TemplateSelectorPreview
								blocks={ this.getBlocksForPreview( previewedTemplate ) }
								viewportWidth={ 1200 }
								title={ ! hidePageTitle && this.getTitleByTemplateSlug( previewedTemplate ) }
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
	withSelect( ( select ) => {
		const getMeta = () => select( 'core/editor' ).getEditedPostAttribute( 'meta' );
		const { _starter_page_template } = getMeta();
		const isOpen = select( 'automattic/starter-page-layouts' ).isOpen();
		return {
			isOpen,
			getMeta,
			_starter_page_template,
			postContentBlock: select( 'core/editor' )
				.getBlocks()
				.find( ( block ) => block.name === 'a8c/post-content' ),
			isWelcomeGuideActive: select( 'core/edit-post' ).isFeatureActive( 'welcomeGuide' ), // Gutenberg 7.2.0 or higher
			areTipsEnabled: select( 'core/nux' ) ? select( 'core/nux' ).areTipsEnabled() : false, // Gutenberg 7.1.0 or lower
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const editorDispatcher = dispatch( 'core/editor' );
		const { setIsOpen } = dispatch( 'automattic/starter-page-layouts' );
		return {
			setIsOpen,
			saveTemplateChoice: ( slug ) => {
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
				// Add filter to let the tracking library know we are inserting a template.
				addFilter( INSERTING_HOOK_NAME, INSERTING_HOOK_NAMESPACE, stubTrue );

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

				// Remove filter.
				removeFilter( INSERTING_HOOK_NAME, INSERTING_HOOK_NAMESPACE );
			},
			hideWelcomeGuide: () => {
				if ( ownProps.isWelcomeGuideActive ) {
					// Gutenberg 7.2.0 or higher.
					dispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuide' );
				} else if ( ownProps.areTipsEnabled ) {
					// Gutenberg 7.1.0 or lower.
					dispatch( 'core/nux' ).disableTips();
				}
			},
		};
	} )
)( PageTemplateModal );
