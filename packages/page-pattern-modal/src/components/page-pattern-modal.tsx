import { parse as parseBlocks } from '@wordpress/blocks';
import {
	Button,
	MenuItem as _MenuItem,
	Modal,
	NavigableMenu,
	VisuallyHidden,
} from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { memoize } from 'lodash';
import containsMissingBlock from '../utils/contains-missing-block';
import { sortGroupNames } from '../utils/group-utils';
import mapBlocksRecursively from '../utils/map-blocks-recursively';
import replacePlaceholders from '../utils/replace-placeholders';
import { trackDismiss, trackSelection, trackView } from '../utils/tracking';
import PatternSelectorControl from './pattern-selector-control';
import type { PatternCategory, PatternDefinition, FormattedPattern } from '../pattern-definition';
import type { ComponentProps, ComponentType } from 'react';

interface PagePatternModalProps {
	areTipsEnabled?: boolean;
	hideWelcomeGuide: () => void;
	insertPattern: ( title: string | null, blocks: unknown[] ) => void;
	instanceId: string | number;
	isOpen: boolean;
	isWelcomeGuideActive?: boolean;
	savePatternChoice: ( name: string, selectedCategory: string | null ) => void;
	onClose: () => void;
	siteInformation?: Record< string, string >;
	patterns: PatternDefinition[];
	title?: string;
	description?: string;
}

interface PagePatternModalState {
	selectedCategory: string | null;
}

// TODO: Remove this wrapper when MenuItem adds back button prop types
type MenuItemProps = ComponentProps< typeof _MenuItem >;
const MenuItem = _MenuItem as ComponentType<
	MenuItemProps & {
		variant?: ComponentProps< typeof Button >[ 'variant' ];
		isPressed?: boolean;
	}
>;

class PagePatternModal extends Component< PagePatternModalProps, PagePatternModalState > {
	constructor( props: PagePatternModalProps ) {
		super( props );
		this.state = {
			selectedCategory: this.getDefaultSelectedCategory(),
		};
	}

	// Parse patterns blocks and memoize them.
	getFormattedPatternsByPatternSlugs = memoize( ( patterns: PatternDefinition[] ) => {
		const blocksByPatternSlugs = patterns.reduce(
			( prev, { name, title = '', description = '', html, pattern_meta } ) => {
				// 1280px is the default value because it's also used when registering patterns from the block-patterns feature in jetpack-mu-wpcom
				const viewportWidth = pattern_meta?.viewport_width
					? Number( pattern_meta.viewport_width )
					: 1280;

				prev[ name ] = {
					name,
					// A lot of patterns don't have a description, so we fallback to the title if it's blank
					title: description || title,
					blocks: html
						? parseBlocks( replacePlaceholders( html, this.props.siteInformation ) )
						: [],
					viewportWidth: Math.max( viewportWidth, 320 ),
				};
				return prev;
			},
			{} as Record< string, FormattedPattern >
		);

		// Remove patterns that include a missing block
		return this.filterPatternsWithMissingBlocks( blocksByPatternSlugs );
	} );

	filterPatternsWithMissingBlocks( patterns: Record< string, FormattedPattern > ) {
		return Object.entries( patterns ).reduce(
			( acc, [ name, pattern ] ) => {
				// Does the pattern contain any missing blocks?
				const patternHasMissingBlocks = containsMissingBlock( pattern.blocks );

				// Only retain the pattern in the collection if:
				// 1. It does not contain any missing blocks
				// 2. There are no blocks at all (likely the "blank" pattern placeholder)
				if ( ! patternHasMissingBlocks || ! pattern.blocks.length ) {
					acc[ name ] = pattern;
				}

				return acc;
			},
			{} as Record< string, FormattedPattern >
		);
	}

	getBlocksForSelection = ( selectedPattern: string ) => {
		const blocks = this.getBlocksByPatternSlug( selectedPattern );
		// Modify the existing blocks returning new block object references.
		return mapBlocksRecursively( blocks, function modifyBlocksForSelection( block ) {
			// Ensure that core/button doesn't link to external pattern site
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

	componentDidUpdate( prevProps: PagePatternModalProps ) {
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
		const categories = this.getPatternCategories();
		if ( ! categories?.length ) {
			return null;
		}

		return categories[ 0 ].slug;
	}

	setPattern = ( name: string ) => {
		// Track selection and mark post as using a pattern in its postmeta.
		trackSelection( name );
		const { selectedCategory } = this.state;
		this.props.savePatternChoice( name, selectedCategory );

		// Check to see if this is a blank pattern selection
		// and reset the pattern if so.
		if ( 'blank' === name ) {
			this.props.insertPattern( '', [] );
			this.props.onClose();
			return;
		}

		const pattern = this.props.patterns.find( ( t ) => t.name === name );
		const isHomepagePattern = ( pattern?.categories || {} ).hasOwnProperty( 'home' );

		// Load content.
		const blocks = this.getBlocksForSelection( name );

		// Only overwrite the page title if the pattern is not one of the Homepage Layouts
		const title = isHomepagePattern ? null : pattern?.title || '';

		// Skip inserting if this is not a blank pattern
		// and there's nothing to insert.
		if ( ! blocks || ! blocks.length ) {
			this.props.onClose();
			return;
		}

		this.props.insertPattern( title, blocks );
		this.props.onClose();
	};

	handleCategorySelection = ( selectedCategory: string | null ) => {
		this.setState( { selectedCategory } );
	};

	closeModal = (
		event?: React.KeyboardEvent< HTMLDivElement > | React.SyntheticEvent< Element, Event >
	) => {
		// As of Gutenberg 13.1, the editor will auto-focus on the title block
		// automatically. See: https://github.com/WordPress/gutenberg/pull/40195.
		// This ends up triggering a `blur` event on the Modal that causes it
		// to close just after the editor loads. To circumvent this, we check if
		// the event is a `blur`, and if that's the case, we return before the
		// function is able to close the modal. Originally, you can't click outside
		// the modal to close it, meaning it doesn't respond to the `blur` event
		// anyways, so it's safe to use this simpler approach instead of trying to
		// check what element triggered the `blur` (which doesn't work when the
		// theme is block-based, as the title block DOM element is not directly
		// accessible as it's inside the `editor-canvas` iframe).
		if ( event?.type === 'blur' ) {
			event.stopPropagation();
			return;
		}

		trackDismiss();
		this.props.onClose();
	};

	getBlocksByPatternSlug( name: string ) {
		return this.getFormattedPatternsByPatternSlugs( this.props.patterns )?.[ name ]?.blocks ?? [];
	}

	getPatternGroups = () => {
		if ( ! this.props.patterns.length ) {
			return null;
		}

		const patternGroups: Record< string, PatternCategory > = {};
		for ( const pattern of this.props.patterns ) {
			for ( const key in pattern.categories ) {
				if ( ! ( key in patternGroups ) ) {
					patternGroups[ key ] = pattern.categories[ key ];
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
		return sortGroupNames( preferredGroupOrder, patternGroups );
	};

	getPatternsForGroup = ( groupName: string ): PatternDefinition[] | null => {
		if ( ! this.props.patterns.length ) {
			return null;
		}

		if ( 'blank' === groupName ) {
			return [ { name: 'blank', title: 'Blank', html: '', ID: null } ];
		}

		const patterns = [];
		for ( const pattern of this.props.patterns ) {
			for ( const key in pattern.categories ) {
				if ( key === groupName ) {
					patterns.push( pattern );
				}
			}
		}

		return patterns;
	};

	getPatternCategories = () => {
		const groups = this.getPatternGroups();

		if ( ! groups ) {
			return null;
		}

		const categories = [];

		for ( const key in groups ) {
			categories.push( { slug: key, name: groups[ key ].title } );
		}

		return categories;
	};

	renderPatternGroup = () => {
		const { selectedCategory } = this.state;
		if ( ! selectedCategory ) {
			return null;
		}

		const patterns = this.getPatternsForGroup( selectedCategory );

		if ( ! patterns?.length ) {
			return null;
		}

		return this.renderPatternsList( patterns );
	};

	renderPatternsList = ( patternsList: PatternDefinition[] ) => {
		if ( ! patternsList.length ) {
			return null;
		}

		// The raw `patterns` prop is not filtered to remove patterns that
		// contain missing Blocks. Therefore we compare with the keys of the
		// filtered patterns from `getBlocksByPatternSlugs()` and filter this
		// list to match. This ensures that the list of pattern thumbnails is
		// filtered so that it does not include patterns that have missing Blocks.
		const formattedPatternsByPatternSlug = this.getFormattedPatternsByPatternSlugs(
			this.props.patterns
		);

		const patternsWithoutMissingBlocks = Object.keys( formattedPatternsByPatternSlug );

		const filterOutPatternsWithMissingBlocks = (
			patternsToFilter: PatternDefinition[],
			filterIn: string[]
		) => {
			return patternsToFilter.filter( ( pattern ) => filterIn.includes( pattern.name ) );
		};

		const filteredPatternsList = filterOutPatternsWithMissingBlocks(
			patternsList,
			patternsWithoutMissingBlocks
		);

		if ( ! filteredPatternsList.length ) {
			return null;
		}

		return (
			<PatternSelectorControl
				label={ __( 'Layout', __i18n_text_domain__ ) }
				patterns={ filteredPatternsList.map(
					( pattern ) => formattedPatternsByPatternSlug[ pattern.name ]
				) }
				onPatternSelect={ this.setPattern }
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
				className="page-pattern-modal"
				onRequestClose={ this.closeModal }
				aria={ {
					labelledby: `page-pattern-modal__heading-${ instanceId }`,
					describedby: `page-pattern-modal__description-${ instanceId }`,
				} }
			>
				<div className="page-pattern-modal__inner">
					<div className="page-pattern-modal__sidebar">
						<h1
							id={ `page-pattern-modal__heading-${ instanceId }` }
							className={ clsx( 'page-pattern-modal__heading', {
								'page-pattern-modal__heading--default': ! this.props.title,
							} ) }
						>
							{ this.props.title || __( 'Add a page', __i18n_text_domain__ ) }
						</h1>
						<p
							id={ `page-pattern-modal__description-${ instanceId }` }
							className="page-pattern-modal__description"
						>
							{ this.props.description ||
								__(
									'Pick a pre-defined layout or start with a blank page.',
									__i18n_text_domain__
								) }
						</p>
						<div className="page-pattern-modal__button-container">
							<Button
								variant="secondary"
								onClick={ () => this.setPattern( 'blank' ) }
								className="page-pattern-modal__blank-button"
							>
								{ __( 'Blank page', __i18n_text_domain__ ) }
							</Button>
							<select
								className="page-pattern-modal__mobile-category-dropdown"
								value={ selectedCategory ?? undefined }
								onChange={ ( e ) => this.handleCategorySelection( e.currentTarget.value ) }
							>
								{ this.getPatternCategories()?.map( ( { slug, name } ) => (
									<option key={ slug } value={ slug }>
										{ name }
									</option>
								) ) }
							</select>
						</div>
						<VisuallyHidden as="h2" id={ `page-pattern-modal__list-heading-${ instanceId }` }>
							{ __( 'Page categories', __i18n_text_domain__ ) }
						</VisuallyHidden>
						<NavigableMenu
							className="page-pattern-modal__category-list"
							orientation="vertical"
							aria-labelledby={ `page-pattern-modal__list-heading-${ instanceId }` }
							onNavigate={ ( _index, child ) =>
								this.handleCategorySelection( child.dataset.slug ?? null )
							}
						>
							{ this.getPatternCategories()?.map( ( { slug, name } ) => (
								<MenuItem
									key={ slug }
									variant="tertiary"
									aria-selected={ slug === selectedCategory }
									data-slug={ slug }
									onClick={ () => this.handleCategorySelection( slug ) }
									className="page-pattern-modal__category-button"
									tabIndex={ slug === selectedCategory ? undefined : -1 }
								>
									<span className="page-pattern-modal__category-item-selection-wrapper">
										{ name }
									</span>
								</MenuItem>
							) ) }
						</NavigableMenu>
					</div>
					<div className="page-pattern-modal__pattern-list-container">
						{ this.renderPatternGroup() }
					</div>
				</div>
			</Modal>
		);
	}
}

export default withInstanceId( PagePatternModal );
