/**
 * External dependencies
 */
import { find, isEmpty, reduce, get, keyBy, mapValues, memoize, stubTrue, omit } from 'lodash';
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
		mapValues( keyBy( templates, 'name' ), 'title' )
	);

	// Parse templates blocks and memoize them.
	getBlocksByTemplateSlugs = memoize( ( templates ) => {
		const blocksByTemplateSlugs = reduce(
			templates,
			( prev, { name, html } ) => {
				prev[ name ] = html
					? parseBlocks( replacePlaceholders( html, this.props.siteInformation ) )
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
			( acc, templateBlocks, name ) => {
				// Does the template contain any missing blocks?
				const templateHasMissingBlocks = containsMissingBlock( templateBlocks );

				// Only retain the template in the collection if:
				// 1. It does not contain any missing blocks
				// 2. There are no blocks at all (likely the "blank" template placeholder)
				if ( ! templateHasMissingBlocks || ! templateBlocks.length ) {
					acc[ name ] = templateBlocks;
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
		trackView( 'add-page' );
	}

	static getDefaultSelectedTemplate = ( props ) => {
		const blankTemplate = get( props.templates, [ 0, 'name' ] );
		const previouslyChosenTemplate = props._starter_page_template;

		// Usually the "new page" case
		if ( ! props.isFrontPage && ! previouslyChosenTemplate ) {
			return blankTemplate;
		}

		// if the page isn't new, select "Current" as the default template
		return 'current';
	};

	setTemplate = ( name ) => {
		// Track selection and mark post as using a template in its postmeta.
		trackSelection( name );
		this.props.saveTemplateChoice( name );

		// Skip setting template if user selects current layout
		if ( 'current' === name ) {
			this.props.setOpenState( false );
			return;
		}

		// Check to see if this is a blank template selection
		// and reset the template if so.
		if ( 'blank' === name ) {
			this.props.insertTemplate( '', [] );
			this.props.setOpenState( false );
			return;
		}

		const isHomepageTemplate = find( this.props.templates, { name, category: 'home' } );

		// Load content.
		const blocks = this.getBlocksForSelection( name );

		// Only overwrite the page title if the template is not one of the Homepage Layouts
		const title = isHomepageTemplate ? null : this.getTitleByTemplateSlug( name );

		// Skip inserting if this is not a blank template
		// and there's nothing to insert.
		if ( ! blocks || ! blocks.length ) {
			this.props.setOpenState( false );
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
				this.props.setOpenState( false );
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

	handleConfirmation = ( name ) => {
		if ( typeof name !== 'string' ) {
			name = this.state.previewedTemplate;
		}

		this.setTemplate( name );
	};

	previewTemplate = ( name ) => {
		this.setState( { previewedTemplate: name } );

		/**
		 * Determines (based on whether the large preview is able to be visible at the
		 * current breakpoint) whether or not the Template selection UI interaction model
		 * should be select _and_ confirm or simply a single "tap to confirm".
		 */
		const largeTplPreviewVisible = window.matchMedia( '(min-width: 660px)' ).matches;
		// Confirm the template when large preview isn't visible
		if ( ! largeTplPreviewVisible ) {
			this.handleConfirmation( name );
		}
	};

	closeModal = ( event ) => {
		// Check to see if the Blur event occurred on the buttons inside of the Modal.
		// If it did then we don't want to dismiss the Modal for this type of Blur.
		if ( event.target.matches( 'button.template-selector-item__label' ) ) {
			return false;
		}

		trackDismiss();

		// Try if we have specific URL to go back to, otherwise go to the page list.
		const calypsoifyCloseUrl = get( window, [ 'calypsoifyGutenberg', 'closeUrl' ] );
		window.top.location = calypsoifyCloseUrl || 'edit.php?post_type=page';
	};

	getBlocksByTemplateSlug( name ) {
		if ( name === 'current' ) {
			return this.props.currentBlocks;
		}
		return get( this.getBlocksByTemplateSlugs( this.props.templates ), [ name ], [] );
	}

	getTitleByTemplateSlug( name ) {
		return get( this.getTitlesByTemplateSlugs( this.props.templates ), [ name ], '' );
	}

	getTemplateGroups = () => {
		if ( ! this.props.templates.length ) {
			return null;
		}

		const templateGroups = {};
		for ( const template of this.props.templates ) {
			for ( const key in template.categories ) {
				if ( ! ( key in templateGroups ) ) {
					templateGroups[ key ] = template.categories[ key ];
				}
			}
		}

		return this.sortGroupsNames( templateGroups );
	};

	sortGroupsNames = ( groups ) => {
		return Object.keys( groups )
			.sort()
			.reduce( ( result, key ) => {
				result[ key ] = groups[ key ];
				return result;
			}, {} );
	};

	getTemplatesForGroup = ( groupName ) => {
		if ( ! this.props.templates.length ) {
			return null;
		}

		if ( 'blank' === groupName ) {
			return [ { name: 'blank', title: 'Blank', html: '' } ];
		}

		if ( 'current' === groupName && '' !== this.props._starter_page_template ) {
			for ( const template of this.props.templates ) {
				if ( this.props._starter_page_template === template.name ) {
					return [ template ];
				}
			}
		}

		const templates = [];
		for ( const template of this.props.templates ) {
			for ( const key in template.categories ) {
				if ( key === groupName ) {
					templates.push( template );
				}
			}
		}

		return templates;
	};

	renderTemplateGroups = () => {
		const unfilteredGroups = this.getTemplateGroups();
		const groups = ! this.props.isFrontPage
			? unfilteredGroups
			: omit( unfilteredGroups, 'home-page' );

		if ( ! groups ) {
			return null;
		}

		const currentGroup =
			'blank' !== this.props._starter_page_template
				? this.renderTemplateGroup( 'current', __( 'Current', 'full-site-editing' ) )
				: null;

		const blankGroup = this.renderTemplateGroup( 'blank', __( 'Blank', 'full-site-editing' ) );

		const homePageGroup = this.props.isFrontPage
			? this.renderTemplateGroup( 'home-page', __( 'Home Page', 'full-site-editing' ) )
			: null;

		const renderedGroups = [];
		for ( const key in groups ) {
			renderedGroups.push( this.renderTemplateGroup( key, groups[ key ].title ) );
		}

		return (
			<>
				{ currentGroup }
				{ blankGroup }
				{ homePageGroup }
				{ renderedGroups }
			</>
		);
	};

	renderTemplateGroup = ( groupName, groupTitle ) => {
		const templates = this.getTemplatesForGroup( groupName );

		if ( ! templates.length ) {
			return null;
		}

		return this.renderTemplatesList( templates, groupName, groupTitle );
	};

	renderTemplatesList = ( templatesList, groupName, groupTitle ) => {
		if ( ! templatesList.length ) {
			return null;
		}

		const isCurrentPreview = templatesList[ 0 ]?.name === 'current';

		const blocksByTemplateSlug = isCurrentPreview
			? { current: this.props.currentBlocks }
			: // The raw `templates` prop is not filtered to remove Templates that
			  // contain missing Blocks. Therefore we compare with the keys of the
			  // filtered templates from `getBlocksByTemplateSlugs()` and filter this
			  // list to match. This ensures that the list of Template thumbnails is
			  // filtered so that it does not include Templates that have missing Blocks.
			  this.getBlocksByTemplateSlugs( this.props.templates );

		const templatesWithoutMissingBlocks = Object.keys( blocksByTemplateSlug );

		const filterOutTemplatesWithMissingBlocks = ( templatesToFilter, filterIn ) => {
			return templatesToFilter.filter( ( template ) => filterIn.includes( template.name ) );
		};

		const filteredTemplatesList = filterOutTemplatesWithMissingBlocks(
			templatesList,
			templatesWithoutMissingBlocks
		);

		if ( ! filteredTemplatesList.length ) {
			return null;
		}

		// Skip rendering current preview if there is no page content.
		if ( isCurrentPreview && ! blocksByTemplateSlug.current?.length ) {
			return null;
		}

		return (
			<fieldset className="page-template-modal__list">
				<legend className="page-template-modal__form-title">{ groupTitle }</legend>

				<TemplateSelectorControl
					label={ __( 'Layout', 'full-site-editing' ) }
					legendLabel={ groupTitle }
					templates={ filteredTemplatesList }
					blocksByTemplates={ blocksByTemplateSlug }
					onTemplateSelect={ this.previewTemplate }
					theme={ this.props.theme }
					locale={ this.props.locale }
					siteInformation={ this.props.siteInformation }
					selectedTemplate={ this.state.previewedTemplate }
				/>
			</fieldset>
		);
	};

	render() {
		const { previewedTemplate, isLoading } = this.state;
		const { hidePageTitle, isOpen, currentBlocks } = this.props;

		if ( ! isOpen ) {
			return null;
		}

		// Sometimes currentBlocks is not loaded before getBlocksForPreview is called
		// getBlocksForPreview memoizes the function call which causes it to always
		// call it with an empty array. We delete the the cache for the function
		// to allow it to memoize the loaded currentBlocks.
		const currentBlocksPreviewCache = this.getBlocksForPreview.cache.get( 'current' );
		if (
			currentBlocksPreviewCache &&
			currentBlocks &&
			currentBlocksPreviewCache.length !== currentBlocks.length
		) {
			this.getBlocksForPreview.cache.delete( 'current' );
		}

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
				<IconButton
					className="page-template-modal__close-button components-icon-button"
					onClick={ this.closeModal }
					icon="arrow-left-alt2"
					label={ __( 'Go back', 'full-site-editing' ) }
				/>

				<div className="page-template-modal__inner">
					{ isLoading ? (
						<div className="page-template-modal__loading">
							<Spinner />
							{ __( 'Adding layout…', 'full-site-editing' ) }
						</div>
					) : (
						<>
							<form className="page-template-modal__form">{ this.renderTemplateGroups() }</form>
							<TemplateSelectorPreview
								blocks={ this.getBlocksForPreview( previewedTemplate ) }
								viewportWidth={ 1200 }
								title={
									! hidePageTitle && previewedTemplate === 'current'
										? this.props.currentPostTitle
										: this.getTitleByTemplateSlug( previewedTemplate )
								}
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
						disabled={ isEmpty( previewedTemplate ) || isLoading }
						onClick={ this.handleConfirmation }
					>
						{ sprintf(
							/* translators: %s is name of a page layout. Eg: Dalston or Blank. */
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
		const { isOpen } = select( 'automattic/starter-page-layouts' );
		const currentBlocks = select( 'core/editor' ).getBlocks();
		return {
			isOpen: isOpen(),
			getMeta,
			_starter_page_template,
			currentBlocks,
			currentPostTitle: select( 'core/editor' ).getCurrentPost().title,
			postContentBlock: currentBlocks.find( ( block ) => block.name === 'a8c/post-content' ),
			isWelcomeGuideActive: select( 'core/edit-post' ).isFeatureActive( 'welcomeGuide' ), // Gutenberg 7.2.0 or higher
			areTipsEnabled: select( 'core/nux' ) ? select( 'core/nux' ).areTipsEnabled() : false, // Gutenberg 7.1.0 or lower
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const editorDispatcher = dispatch( 'core/editor' );
		const { setOpenState } = dispatch( 'automattic/starter-page-layouts' );
		return {
			setOpenState,
			saveTemplateChoice: ( name ) => {
				// Save selected template slug in meta.
				const currentMeta = ownProps.getMeta();
				editorDispatcher.editPost( {
					meta: {
						...currentMeta,
						_starter_page_template: name,
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
