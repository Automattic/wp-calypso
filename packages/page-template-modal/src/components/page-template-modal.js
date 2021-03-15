/**
 * External dependencies
 */
import { find, reduce, get, memoize } from 'lodash';
import { __ } from '@wordpress/i18n';
import { Button, Modal } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { parse as parseBlocks } from '@wordpress/blocks';
import { withInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import TemplateSelectorControl from './template-selector-control';
import { trackDismiss, trackSelection, trackView } from '../utils/tracking';
import replacePlaceholders from '../utils/replace-placeholders';
import mapBlocksRecursively from '../utils/map-blocks-recursively';
import containsMissingBlock from '../utils/contains-missing-block';
import { sortGroupNames } from '../utils/group-utils';

class PageTemplateModal extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			selectedCategory: this.getDefaultSelectedCategory(),
		};
	}

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

	getDefaultSelectedCategory() {
		const categories = this.getTemplateCategories();
		if ( ! categories?.length ) {
			return null;
		}

		return categories[ 0 ].slug;
	}

	setTemplate = ( name ) => {
		// Track selection and mark post as using a template in its postmeta.
		trackSelection( name );
		this.props.saveTemplateChoice( name );

		// Check to see if this is a blank template selection
		// and reset the template if so.
		if ( 'blank' === name ) {
			this.props.insertTemplate( '', [] );
			this.props.setOpenState( false );
			return;
		}

		const template = find( this.props.templates, { name } );

		// Load content.
		const blocks = this.getBlocksForSelection( name );

		// Only overwrite the page title if the template is not one of the Homepage Layouts
		const title = template.category === 'home' ? null : template.title || '';

		// Skip inserting if this is not a blank template
		// and there's nothing to insert.
		if ( ! blocks || ! blocks.length ) {
			this.props.setOpenState( false );
			return;
		}

		this.props.insertTemplate( title, blocks );
		this.props.setOpenState( false );
	};

	handleCategorySelection = ( selectedCategory ) => {
		this.setState( { selectedCategory } );
	};

	closeModal = () => {
		trackDismiss();

		// Try if we have specific URL to go back to, otherwise go to the page list.
		const calypsoifyCloseUrl = get( window, [ 'calypsoifyGutenberg', 'closeUrl' ] );
		window.top.location = calypsoifyCloseUrl || 'edit.php?post_type=page';
	};

	getBlocksByTemplateSlug( name ) {
		return get( this.getBlocksByTemplateSlugs( this.props.templates ), [ name ], [] );
	}

	getTemplateGroups = () => {
		if ( ! this.props.templates.length ) {
			return null;
		}

		const templateGroups = {};
		for ( const template of this.props.templates ) {
			for ( const key in template.categories ) {
				// Temporarily skip the 'featured' category so that we can expose it at another time.
				if ( key !== 'featured' && ! ( key in templateGroups ) ) {
					templateGroups[ key ] = template.categories[ key ];
				}
			}
		}

		const preferredGroupOrder = [ 'about', 'blog', 'home-page', 'gallery', 'services', 'contact' ];
		return sortGroupNames( preferredGroupOrder, templateGroups );
	};

	getTemplatesForGroup = ( groupName ) => {
		if ( ! this.props.templates.length ) {
			return null;
		}

		if ( 'blank' === groupName ) {
			return [ { name: 'blank', title: 'Blank', html: '' } ];
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

	getTemplateCategories = () => {
		const groups = this.getTemplateGroups();

		if ( ! groups ) {
			return null;
		}

		const categories = [];

		for ( const key in groups ) {
			categories.push( { slug: key, name: groups[ key ].title } );
		}

		return categories;
	};

	renderTemplateGroup = ( groupName, groupTitle ) => {
		const templates = this.getTemplatesForGroup( groupName );

		if ( ! templates.length ) {
			return null;
		}

		return this.renderTemplatesList( templates, groupTitle );
	};

	renderTemplatesList = ( templatesList, groupTitle ) => {
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
			return templatesToFilter.filter( ( template ) => filterIn.includes( template.name ) );
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
				<TemplateSelectorControl
					label={ __( 'Layout', __i18n_text_domain__ ) }
					legendLabel={ groupTitle }
					templates={ filteredTemplatesList }
					onTemplateSelect={ this.setTemplate }
					theme={ this.props.theme }
					locale={ this.props.locale }
					siteInformation={ this.props.siteInformation }
				/>
			</fieldset>
		);
	};

	render() {
		const { selectedCategory } = this.state;
		const { isOpen, instanceId } = this.props;

		if ( ! isOpen ) {
			return null;
		}

		return (
			<Modal
				className="page-template-modal"
				onRequestClose={ this.closeModal }
				aria={ {
					// TODO: `labelledby` option isn't working because of a <Modal> bug in Gutenberg: WordPress/gutenboarding#29020
					labelledby: `page-template-modal__heading-${ instanceId }`,
					describedby: `page-template-modal__description-${ instanceId }`,
				} }
			>
				<div className="page-template-modal__inner">
					<div className="page-template-modal__sidebar">
						<h1
							id={ `page-template-modal__heading-${ instanceId }` }
							className="page-template-modal__heading"
						>
							{ __( 'Add a page', __i18n_text_domain__ ) }
						</h1>
						<p
							id={ `page-template-modal__description-${ instanceId }` }
							className="page-template-modal__description"
						>
							{ __(
								'Pick a pre-defined layout or start with a blank page.',
								__i18n_text_domain__
							) }
						</p>
						<div className="page-template-modal__button-container">
							<Button
								isSecondary
								onClick={ () => this.setTemplate( 'blank' ) }
								className="page-template-modal__blank-button"
							>
								{ __( 'Blank page', __i18n_text_domain__ ) }
							</Button>
							<select
								className="page-template-modal__mobile-category-dropdown"
								value={ selectedCategory }
								onChange={ ( e ) => this.handleCategorySelection( e.currentTarget.value ) }
							>
								{ this.getTemplateCategories().map( ( { slug, name } ) => (
									<option key={ slug } value={ slug }>
										{ name }
									</option>
								) ) }
							</select>
						</div>
						<ul className="page-template-modal__category-list">
							{ this.getTemplateCategories().map( ( { slug, name } ) => (
								<li key={ slug }>
									<Button
										isTertiary
										isPressed={ slug === selectedCategory }
										onClick={ () => this.handleCategorySelection( slug ) }
									>
										{ name }
									</Button>
								</li>
							) ) }
						</ul>
					</div>
					<div className="page-template-modal__template-list-container">
						{ this.renderTemplateGroup(
							selectedCategory,
							this.getTemplateGroups()[ selectedCategory ]?.title
						) }
					</div>
				</div>
			</Modal>
		);
	}
}

export default withInstanceId( PageTemplateModal );
