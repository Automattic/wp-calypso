import { BlockInstance, parse as parseBlocks } from '@wordpress/blocks';
import { Button, MenuItem, Modal, NavigableMenu, VisuallyHidden } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { memoize } from 'lodash';
import containsMissingBlock from '../utils/contains-missing-block';
import { sortGroupNames } from '../utils/group-utils';
import mapBlocksRecursively from '../utils/map-blocks-recursively';
import replacePlaceholders from '../utils/replace-placeholders';
import { trackDismiss, trackSelection, trackView } from '../utils/tracking';
import PatternSelectorControl from './pattern-selector-control';
import type { PatternCategory, PatternDefinition } from '../pattern-definition';
import type { KeyboardEvent, MouseEvent, FocusEvent } from 'react';

interface PagePatternModalProps {
	areTipsEnabled?: boolean;
	hideWelcomeGuide: () => void;
	insertPattern: ( title: string | null, blocks: unknown[] ) => void;
	instanceId: number;
	isOpen: boolean;
	isWelcomeGuideActive?: boolean;
	locale?: string;
	savePatternChoice: ( name: string ) => void;
	onClose: () => void;
	siteInformation?: Record< string, string >;
	patterns: PatternDefinition[];
	theme?: string;
	title?: string;
	description?: string;
}

interface PagePatternModalState {
	selectedCategory: string | null;
}

type CloseModalEvent = KeyboardEvent | MouseEvent | FocusEvent;

class PagePatternModal extends Component< PagePatternModalProps, PagePatternModalState > {
	constructor( props: PagePatternModalProps ) {
		super( props );
		this.state = {
			selectedCategory: this.getDefaultSelectedCategory(),
		};
	}

	// Parse patterns blocks and memoize them.
	getBlocksByPatternSlugs = memoize( ( patterns: PatternDefinition[] ) => {
		const blocksByPatternSlugs = patterns.reduce( ( prev, { name, html } ) => {
			prev[ name ] = html
				? parseBlocks( replacePlaceholders( html, this.props.siteInformation ) )
				: [];
			return prev;
		}, {} as Record< string, BlockInstance[] > );

		// Remove patterns that include a missing block
		return this.filterPatternsWithMissingBlocks( blocksByPatternSlugs );
	} );

	filterPatternsWithMissingBlocks( patterns: Record< string, BlockInstance[] > ) {
		return Object.entries( patterns ).reduce( ( acc, [ name, patternBlocks ] ) => {
			// Does the pattern contain any missing blocks?
			const patternHasMissingBlocks = containsMissingBlock( patternBlocks );

			// Only retain the pattern in the collection if:
			// 1. It does not contain any missing blocks
			// 2. There are no blocks at all (likely the "blank" pattern placeholder)
			if ( ! patternHasMissingBlocks || ! patternBlocks.length ) {
				acc[ name ] = patternBlocks;
			}

			return acc;
		}, {} as Record< string, BlockInstance[] > );
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
		this.props.savePatternChoice( name );

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

	closeModal = ( event: CloseModalEvent ) => {
		// As of Gutenberg 13.1, the editor will auto-focus on the title block
		// automatically. See: https://github.com/WordPress/gutenberg/pull/40195.
		// This ends up triggering a `blur` event on the Modal that causes it
		// to close just after the editor loads. To circumvent this, we check if
		// the `blur` event is related to the title auto-focus and if so,
		// we ignore it so that the Modal stays open. It's important to note
		// that this callback handles more than the  event, though. See the
		// `CloseModalEvent` type for more info.

		// Let's narrow-down the types to be able to safely handle the `blur` scenario
		// `KeyboardEvent` doesn't have a `relatedTarget` property, and the `MouseEvent`'s
		// `relatedTarget` type doesn't have a `className` property, though for those events
		// the Modal can just close and we don't need the piece of logic below:
		if ( 'relatedTarget' in event && event.relatedTarget && 'className' in event.relatedTarget ) {
			if ( event.relatedTarget?.className?.match( /wp-block-post-title/ ) ) {
				event.stopPropagation();
				return;
			}
		}

		trackDismiss();
		this.props.onClose();
	};

	getBlocksByPatternSlug( name: string ) {
		return this.getBlocksByPatternSlugs( this.props.patterns )?.[ name ] ?? [];
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

		const groupTitle = this.getPatternGroups()?.[ selectedCategory ]?.title;

		return this.renderPatternsList( patterns, groupTitle );
	};

	renderPatternsList = ( patternsList: PatternDefinition[], groupTitle?: string ) => {
		if ( ! patternsList.length ) {
			return null;
		}

		// The raw `patterns` prop is not filtered to remove patterns that
		// contain missing Blocks. Therefore we compare with the keys of the
		// filtered patterns from `getBlocksByPatternSlugs()` and filter this
		// list to match. This ensures that the list of pattern thumbnails is
		// filtered so that it does not include patterns that have missing Blocks.
		const blocksByPatternSlug = this.getBlocksByPatternSlugs( this.props.patterns );

		const patternsWithoutMissingBlocks = Object.keys( blocksByPatternSlug );

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
				legendLabel={ groupTitle }
				patterns={ filteredPatternsList }
				onPatternSelect={ this.setPattern }
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
				className="page-pattern-modal"
				// @ts-expect-error `onRequestClose`'s type is () => void but ideally but
				// in reality, it might receive an event object that might be one of multiple
				// types (see the `CloseModalEvent` type above for more info). We ignore the
				// error for now until the type is updated in DefinitelyTyped.
				// DT PR: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60127.
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
							className={ classnames( 'page-pattern-modal__heading', {
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
								isSecondary
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
									isTertiary
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
