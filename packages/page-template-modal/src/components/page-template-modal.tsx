/**
 * External dependencies
 */
import { memoize } from 'lodash';
import { __ } from '@wordpress/i18n';
import { Button, MenuItem, Modal, NavigableMenu, VisuallyHidden } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { BlockInstance, parse as parseBlocks } from '@wordpress/blocks';
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

interface PageTemplateModalProps {
	areTipsEnabled?: boolean;
	hideWelcomeGuide: () => void;
	insertTemplate: ( title: string | null, blocks: unknown[] ) => void;
	instanceId: number;
	isOpen: boolean;
	isWelcomeGuideActive?: boolean;
	locale?: string;
	saveTemplateChoice: ( name: string ) => void;
	setOpenState: ( isOpen: boolean ) => void;
	siteInformation?: Record< string, string >;
	templates: LayoutDefinition[];
	theme?: string;
}

interface PageTemplateModalState {
	selectedCategory: string | null;
}

class PageTemplateModal extends Component< PageTemplateModalProps, PageTemplateModalState > {
	constructor( props: PageTemplateModalProps ) {
		super( props );
		this.state = {
			selectedCategory: this.getDefaultSelectedCategory(),
		};
	}

	// Parse templates blocks and memoize them.
	getBlocksByTemplateSlugs = memoize( ( templates: LayoutDefinition[] ) => {
		const blocksByTemplateSlugs = templates.reduce( ( prev, { name, html } ) => {
			prev[ name ] = html
				? parseBlocks( replacePlaceholders( html, this.props.siteInformation ) )
				: [];
			return prev;
		}, {} as Record< string, BlockInstance[] > );

		// Remove templates that include a missing block
		return this.filterTemplatesWithMissingBlocks( blocksByTemplateSlugs );
	} );

	filterTemplatesWithMissingBlocks( templates: Record< string, BlockInstance[] > ) {
		return Object.entries( templates ).reduce( ( acc, [ name, templateBlocks ] ) => {
			// Does the template contain any missing blocks?
			const templateHasMissingBlocks = containsMissingBlock( templateBlocks );

			// Only retain the template in the collection if:
			// 1. It does not contain any missing blocks
			// 2. There are no blocks at all (likely the "blank" template placeholder)
			if ( ! templateHasMissingBlocks || ! templateBlocks.length ) {
				acc[ name ] = templateBlocks;
			}

			return acc;
		}, {} as Record< string, BlockInstance[] > );
	}

	getBlocksForSelection = ( selectedTemplate: string ) => {
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

	componentDidUpdate( prevProps: PageTemplateModalProps ) {
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

	setTemplate = ( name: string ) => {
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

		const template = this.props.templates.find( ( t ) => t.name === name );
		const isHomepageTemplate = ( template?.categories || {} ).hasOwnProperty( 'home' );

		// Load content.
		const blocks = this.getBlocksForSelection( name );

		// Only overwrite the page title if the template is not one of the Homepage Layouts
		const title = isHomepageTemplate ? null : template?.title || '';

		// Skip inserting if this is not a blank template
		// and there's nothing to insert.
		if ( ! blocks || ! blocks.length ) {
			this.props.setOpenState( false );
			return;
		}

		this.props.insertTemplate( title, blocks );
		this.props.setOpenState( false );
	};

	handleCategorySelection = ( selectedCategory: string | null ) => {
		this.setState( { selectedCategory } );
	};

	closeModal = () => {
		trackDismiss();
		this.props.setOpenState( false );
	};

	getBlocksByTemplateSlug( name: string ) {
		return this.getBlocksByTemplateSlugs( this.props.templates )?.[ name ] ?? [];
	}

	getTemplateGroups = () => {
		if ( ! this.props.templates.length ) {
			return null;
		}

		const templateGroups: Record< string, LayoutCategory > = {};
		for ( const template of this.props.templates ) {
			for ( const key in template.categories ) {
				if ( ! ( key in templateGroups ) ) {
					templateGroups[ key ] = template.categories[ key ];
				}
			}
		}

		const preferredGroupOrder = [
			'featured',
			'about',
			'blog',
			'home',
			'gallery',
			'services',
			'contact',
		];
		return sortGroupNames( preferredGroupOrder, templateGroups );
	};

	getTemplatesForGroup = ( groupName: string ): LayoutDefinition[] | null => {
		if ( ! this.props.templates.length ) {
			return null;
		}

		if ( 'blank' === groupName ) {
			return [ { name: 'blank', title: 'Blank', html: '', ID: null } ];
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

	renderTemplateGroup = () => {
		const { selectedCategory } = this.state;
		if ( ! selectedCategory ) {
			return null;
		}

		const templates = this.getTemplatesForGroup( selectedCategory );

		if ( ! templates?.length ) {
			return null;
		}

		const groupTitle = this.getTemplateGroups()?.[ selectedCategory ]?.title;

		return this.renderTemplatesList( templates, groupTitle );
	};

	renderTemplatesList = ( templatesList: LayoutDefinition[], groupTitle?: string ) => {
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

		const filterOutTemplatesWithMissingBlocks = (
			templatesToFilter: LayoutDefinition[],
			filterIn: string[]
		) => {
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
			<TemplateSelectorControl
				label={ __( 'Layout', __i18n_text_domain__ ) }
				legendLabel={ groupTitle }
				templates={ filteredTemplatesList }
				onTemplateSelect={ this.setTemplate }
				theme={ this.props.theme }
				locale={ this.props.locale }
				siteInformation={ this.props.siteInformation }
			/>
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
				title="" // We're providing the title with the `aria.labelledby` prop
				className="page-template-modal"
				onRequestClose={ this.closeModal }
				aria={ {
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
								value={ selectedCategory ?? undefined }
								onChange={ ( e ) => this.handleCategorySelection( e.currentTarget.value ) }
							>
								{ this.getTemplateCategories()?.map( ( { slug, name } ) => (
									<option key={ slug } value={ slug }>
										{ name }
									</option>
								) ) }
							</select>
						</div>
						<VisuallyHidden as="h2" id={ `page-template-modal__list-heading-${ instanceId }` }>
							{ __( 'Page categories', __i18n_text_domain__ ) }
						</VisuallyHidden>
						<NavigableMenu
							className="page-template-modal__category-list"
							orientation="vertical"
							aria-labelledby={ `page-template-modal__list-heading-${ instanceId }` }
							onNavigate={ ( _index, child ) =>
								this.handleCategorySelection( child.dataset.slug ?? null )
							}
						>
							{ this.getTemplateCategories()?.map( ( { slug, name } ) => (
								<MenuItem
									key={ slug }
									isTertiary
									aria-selected={ slug === selectedCategory }
									data-slug={ slug }
									onClick={ () => this.handleCategorySelection( slug ) }
									className="page-template-modal__category-button"
									tabIndex={ slug === selectedCategory ? undefined : -1 }
								>
									<span className="page-template-modal__category-item-selection-wrapper">
										{ name }
									</span>
								</MenuItem>
							) ) }
						</NavigableMenu>
					</div>
					<div className="page-template-modal__template-list-container">
						{ this.renderTemplateGroup() }
					</div>
				</div>
			</Modal>
		);
	}
}

export default withInstanceId( PageTemplateModal );
