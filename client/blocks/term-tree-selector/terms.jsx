import { FormLabel } from '@automattic/components';
import { range } from '@automattic/js-utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce } from '@wordpress/compose';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { filter, map } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import QueryTerms from 'calypso/components/data/query-terms';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormRadio from 'calypso/components/forms/form-radio';
import PodcastIndicator from 'calypso/components/podcast-indicator';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { decodeEntities } from 'calypso/lib/formatting';
import getPodcastingCategoryId from 'calypso/state/selectors/get-podcasting-category-id';
import {
	getTermsForQueryIgnoringPage,
	getTermsLastPageForQuery,
	isRequestingTermsForQueryIgnoringPage,
} from 'calypso/state/terms/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import NoResults from './no-results';
import Search from './search';

import './terms.scss';

/**
 * Constants
 */
const SEARCH_DEBOUNCE_TIME_MS = 500;
const DEFAULT_TERMS_PER_PAGE = 100;
const LOAD_OFFSET = 10;
const ITEM_HEIGHT = 25;
const OVERSCAN_ROW_COUNT = 5;

const EMPTY_TERMS = Object.freeze( [] );

function TermTreeSelectorList( {
	hideTermAndChildren,
	terms = EMPTY_TERMS,
	taxonomy,
	multiple,
	selected = [],
	siteId,
	defaultTermId,
	lastPage,
	query,
	onSearch = () => {},
	onChange = () => {},
	isError,
	height = 300,
	className,
	compact,
	loading = true,
	emptyMessage,
	createLink,
	searchThreshold = 8,
	podcastingCategoryId,
	analyticsPrefix = 'Category Selector',
} ) {
	const translate = useTranslate();

	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ requestedPages, setRequestedPages ] = useState( () => Object.freeze( [ 1 ] ) );

	const scrollElementRef = useRef( null );
	// Cache of measured row heights keyed by term ID, mirroring the previous
	// `itemHeights` map populated from each row's `clientHeight`.
	const itemHeightsRef = useRef( {} );
	const hasPerformedSearchRef = useRef( false );

	const termIds = useMemo( () => map( terms, 'ID' ), [ terms ] );

	// Memoize children lookups for the lifetime of a given `terms` array.
	const getTermChildren = useMemo( () => {
		const cache = new Map();
		return ( termId ) => {
			if ( cache.has( termId ) ) {
				return cache.get( termId );
			}
			const children = filter( terms, ( { parent } ) => parent === termId );
			cache.set( termId, children );
			return children;
		};
	}, [ terms ] );

	const debouncedSearch = useMemo(
		() =>
			debounce( ( value ) => {
				onSearch( value );
			}, SEARCH_DEBOUNCE_TIME_MS ),
		[ onSearch ]
	);

	const hasNoSearchResults = ! loading && terms && ! terms.length && !! searchTerm.length;
	const hasNoTerms = ! loading && terms && ! terms.length;

	const getItem = useCallback(
		( index ) => {
			if ( terms ) {
				return terms[ index ];
			}
		},
		[ terms ]
	);

	const isSmall = ( () => {
		if ( ! terms || searchTerm ) {
			return false;
		}
		return terms.length < searchThreshold;
	} )();

	// Recursive measured-height estimate, preserving the original 0-height
	// returns (nested children whose parent is in the payload, and the excluded
	// subtree) so a real measured 0 survives the `typeof` check below.
	const getItemHeight = useCallback(
		( item, _recurse = false ) => {
			if ( ! item ) {
				return ITEM_HEIGHT;
			}

			// if item has a parent, and parent is in payload, height is already part of parent
			if ( item.parent && ! _recurse && termIds.includes( item.parent ) ) {
				return 0;
			}

			// If this subtree is excluded, do not render
			if ( item.ID === hideTermAndChildren ) {
				return 0;
			}

			const measured = itemHeightsRef.current[ item.ID ];
			if ( typeof measured === 'number' && measured ) {
				return measured;
			}

			return filter( terms, ( { parent } ) => parent === item.ID ).reduce(
				( memo, childItem ) => memo + getItemHeight( childItem, true ),
				ITEM_HEIGHT
			);
		},
		[ terms, termIds, hideTermAndChildren ]
	);

	const getRowCount = ( () => {
		let count = 0;
		if ( terms ) {
			count += terms.length;
		}
		if ( loading || ! terms ) {
			count += 1;
		}
		return count;
	} )();

	const estimateSize = useCallback(
		( index ) => {
			const measured = getItemHeight( getItem( index ) );
			return typeof measured === 'number' ? measured : ITEM_HEIGHT;
		},
		[ getItemHeight, getItem ]
	);

	const virtualizer = useVirtualizer( {
		count: getRowCount,
		getScrollElement: () => scrollElementRef.current,
		estimateSize,
		overscan: OVERSCAN_ROW_COUNT,
	} );

	// A prop change re-renders automatically, but measured heights are cached in
	// the virtualizer; re-measure on `terms`/`selected` changes so stale heights
	// (e.g. after a new search or a selection toggle) are not reused.
	useEffect( () => {
		virtualizer.measure();
	}, [ terms, selected, virtualizer ] );

	const virtualItems = virtualizer.getVirtualItems();
	const firstIndex = virtualItems[ 0 ]?.index;
	const lastIndex = virtualItems[ virtualItems.length - 1 ]?.index;

	// Request the pages covering the visible range (plus a lookahead offset),
	// mirroring the previous `onRowsRendered` + page math.
	useEffect( () => {
		if ( firstIndex === undefined || lastIndex === undefined ) {
			return;
		}
		const perPage = query?.number || DEFAULT_TERMS_PER_PAGE;
		const getPageForIndex = ( index ) => {
			const page = Math.ceil( index / perPage );
			return Math.max( Math.min( page, lastPage || Infinity ), 1 );
		};
		setRequestedPages( ( current ) => {
			const pagesToRequest = range(
				getPageForIndex( firstIndex - LOAD_OFFSET ),
				getPageForIndex( lastIndex + LOAD_OFFSET ) + 1
			).filter( ( page ) => ! current.includes( page ) );

			if ( ! pagesToRequest.length ) {
				return current;
			}
			return current.concat( pagesToRequest );
		} );
	}, [ firstIndex, lastIndex, query?.number, lastPage ] );

	// Measure each rendered row and cache its height keyed by term ID. When a
	// height changes, ask the virtualizer to re-measure on the next tick.
	const queueRecomputeRowHeights = useMemo(
		() =>
			debounce( () => {
				virtualizer.measure();
			}, 0 ),
		[ virtualizer ]
	);

	const setItemRef = useCallback(
		( item, itemRef ) => {
			if ( ! itemRef || ! item ) {
				return;
			}

			// By falling back to the item height constant, we avoid an unnecessary
			// forced update if all of the items match our guessed height
			const previousHeight = itemHeightsRef.current[ item.ID ] || ITEM_HEIGHT;
			const nextHeight = itemRef.clientHeight;
			itemHeightsRef.current[ item.ID ] = nextHeight;

			if ( previousHeight !== nextHeight ) {
				queueRecomputeRowHeights();
			}
		},
		[ queueRecomputeRowHeights ]
	);

	const handleSearch = ( event ) => {
		const nextSearchTerm = event.target.value;
		if ( searchTerm && ! nextSearchTerm ) {
			onSearch( '' );
		}

		if ( nextSearchTerm === searchTerm ) {
			return;
		}

		if ( ! hasPerformedSearchRef.current ) {
			hasPerformedSearchRef.current = true;
			gaRecordEvent( analyticsPrefix, 'Performed Term Search' );
		}

		setSearchTerm( nextSearchTerm );
		debouncedSearch( nextSearchTerm );
	};

	const renderItem = ( item, _recurse = false ) => {
		// if item has a parent and it is in current props.terms, do not render
		if ( item.parent && ! _recurse && termIds.includes( item.parent ) ) {
			return;
		}

		// If this subtree is excluded, do not render
		if ( item.ID === hideTermAndChildren ) {
			return;
		}

		const handleChange = ( ...args ) => onChange( item, ...args );
		const setRef = ( ...args ) => setItemRef( item, ...args );
		const children = getTermChildren( item.ID );

		const itemId = item.ID;
		const isPodcastingCategory = taxonomy === 'category' && podcastingCategoryId === itemId;
		const name = decodeEntities( item.name ) || translate( 'Untitled' );
		const checked = selected.includes( itemId );
		const InputComponent = multiple ? FormCheckbox : FormRadio;
		const disabled =
			multiple && checked && defaultTermId && 1 === selected.length && defaultTermId === itemId;

		const input = (
			<InputComponent
				value={ itemId }
				onChange={ handleChange }
				disabled={ disabled }
				checked={ checked }
			/>
		);

		return (
			<div key={ itemId } ref={ setRef } className="term-tree-selector__list-item">
				<FormLabel>
					{ input }
					<span className="term-tree-selector__label">
						{ name }
						{ isPodcastingCategory && <PodcastIndicator size={ 18 } /> }
					</span>
				</FormLabel>
				{ children.length > 0 && (
					<div className="term-tree-selector__nested-list">
						{ children.map( ( child ) => renderItem( child, true ) ) }
					</div>
				) }
			</div>
		);
	};

	const renderNoResults = () => {
		if ( hasNoSearchResults || hasNoTerms ) {
			return (
				<div key="no-results" className="term-tree-selector__list-item is-empty">
					{ ( hasNoSearchResults || ! emptyMessage ) && <NoResults createLink={ createLink } /> }
					{ hasNoTerms && emptyMessage }
				</div>
			);
		}
	};

	const renderRow = ( index ) => {
		const item = getItem( index );
		if ( item ) {
			return renderItem( item );
		}

		const InputComponent = multiple ? FormCheckbox : FormRadio;

		return (
			<div key="placeholder" className="term-tree-selector__list-item is-placeholder">
				<FormLabel>
					<InputComponent disabled className="term-tree-selector__input" />
					<span className="term-tree-selector__label">{ translate( 'Loading…' ) }</span>
				</FormLabel>
			</div>
		);
	};

	const searchLength = searchTerm.length;
	const showSearch =
		( searchLength > 0 || ! isSmall ) && ( terms || ( ! terms && searchLength > 0 ) );
	const classes = clsx( 'term-tree-selector', className, {
		'is-loading': loading,
		'is-small': isSmall,
		'is-error': isError,
		'is-compact': compact,
	} );

	const totalSize = virtualizer.getTotalSize();
	// "Small" mode renders at full content height with no inner scrollbar; the
	// non-small case is a fixed-height scroll container with `overflow-y: auto`.
	const scrollStyle = isSmall
		? { blockSize: totalSize, overflowY: 'visible' }
		: { blockSize: height, overflowY: 'auto' };

	return (
		<div className={ classes }>
			{ requestedPages.map( ( page ) => (
				<QueryTerms
					key={ `query-${ page }` }
					siteId={ siteId }
					taxonomy={ taxonomy }
					query={ { ...query, page } }
				/>
			) ) }
			{ taxonomy === 'category' && siteId && <QuerySiteSettings siteId={ siteId } /> }

			{ showSearch && <Search searchTerm={ searchTerm } onSearch={ handleSearch } /> }
			<div ref={ scrollElementRef } className="term-tree-selector__results" style={ scrollStyle }>
				{ getRowCount === 0 ? (
					renderNoResults()
				) : (
					<div
						style={ {
							position: 'relative',
							inlineSize: '100%',
							blockSize: totalSize,
						} }
					>
						{ virtualItems.map( ( virtualRow ) => (
							<div
								key={ virtualRow.key }
								data-index={ virtualRow.index }
								ref={ virtualizer.measureElement }
								style={ {
									position: 'absolute',
									insetBlockStart: 0,
									insetInlineStart: 0,
									inlineSize: '100%',
									transform: `translateY(${ virtualRow.start }px)`,
								} }
							>
								{ renderRow( virtualRow.index ) }
							</div>
						) ) }
					</div>
				) }
			</div>
		</div>
	);
}

TermTreeSelectorList.propTypes = {
	hideTermAndChildren: PropTypes.number,
	terms: PropTypes.array,
	taxonomy: PropTypes.string,
	multiple: PropTypes.bool,
	selected: PropTypes.array,
	search: PropTypes.string,
	siteId: PropTypes.number,
	defaultTermId: PropTypes.number,
	lastPage: PropTypes.number,
	onSearch: PropTypes.func,
	onChange: PropTypes.func,
	isError: PropTypes.bool,
	height: PropTypes.number,
	className: PropTypes.string,
	compact: PropTypes.bool,
	loading: PropTypes.bool,
	emptyMessage: PropTypes.node,
	createLink: PropTypes.string,
	searchThreshold: PropTypes.number,
	query: PropTypes.object,
	podcastingCategoryId: PropTypes.number,
	analyticsPrefix: PropTypes.string,
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const { taxonomy, query } = ownProps;

	// A parent component may pass in the podcasting category ID (like in the
	// settings page, where the user may not have saved their selection yet)...
	let podcastingCategoryId = ownProps.podcastingCategoryId;
	if ( typeof podcastingCategoryId === 'undefined' && taxonomy === 'category' ) {
		// ... or we may fetch it from state ourselves (like in the editor).
		podcastingCategoryId = getPodcastingCategoryId( state, siteId );
	}

	return {
		loading: isRequestingTermsForQueryIgnoringPage( state, siteId, taxonomy, query ),
		terms: getTermsForQueryIgnoringPage( state, siteId, taxonomy, query ),
		lastPage: getTermsLastPageForQuery( state, siteId, taxonomy, query ),
		siteId,
		query,
		podcastingCategoryId,
	};
} )( TermTreeSelectorList );
