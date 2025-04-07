/**
 * WordPress dependencies
 */
import {
	memo,
	useContext,
	useRef,
	useMemo,
	useCallback,
	useEffect,
} from '@wordpress/element';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { funnel } from '@wordpress/icons';
import { __, _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import FilterSummary from './filter-summary';
import { default as AddFilter, AddFilterMenu } from './add-filter';
import ResetFilters from './reset-filters';
import DataViewsContext from '../dataviews-context';
import { sanitizeOperators } from '../../utils';
import { ALL_OPERATORS, OPERATOR_IS, OPERATOR_IS_NOT } from '../../constants';
import type { NormalizedFilter, NormalizedField, View } from '../../types';

export function useFilters( fields: NormalizedField< any >[], view: View ) {
	return useMemo( () => {
		const filters: NormalizedFilter[] = [];
		fields.forEach( ( field ) => {
			if ( ! field.elements?.length ) {
				return;
			}

			const operators = sanitizeOperators( field );
			if ( operators.length === 0 ) {
				return;
			}

			const isPrimary = !! field.filterBy?.isPrimary;
			filters.push( {
				field: field.id,
				name: field.label,
				elements: field.elements,
				singleSelection: operators.some( ( op ) =>
					[ OPERATOR_IS, OPERATOR_IS_NOT ].includes( op )
				),
				operators,
				isVisible:
					isPrimary ||
					!! view.filters?.some(
						( f ) =>
							f.field === field.id &&
							ALL_OPERATORS.includes( f.operator )
					),
				isPrimary,
			} );
		} );
		// Sort filters by primary property. We need the primary filters to be first.
		// Then we sort by name.
		filters.sort( ( a, b ) => {
			if ( a.isPrimary && ! b.isPrimary ) {
				return -1;
			}
			if ( ! a.isPrimary && b.isPrimary ) {
				return 1;
			}
			return a.name.localeCompare( b.name );
		} );
		return filters;
	}, [ fields, view ] );
}

export function FiltersToggle( {
	filters,
	view,
	onChangeView,
	setOpenedFilter,
	isShowingFilter,
	setIsShowingFilter,
}: {
	filters: NormalizedFilter[];
	view: View;
	onChangeView: ( view: View ) => void;
	setOpenedFilter: ( filter: string | null ) => void;
	isShowingFilter: boolean;
	setIsShowingFilter: React.Dispatch< React.SetStateAction< boolean > >;
} ) {
	const buttonRef = useRef< HTMLButtonElement >( null );
	const onChangeViewWithFilterVisibility = useCallback(
		( _view: View ) => {
			onChangeView( _view );
			setIsShowingFilter( true );
		},
		[ onChangeView, setIsShowingFilter ]
	);
	const visibleFilters = filters.filter( ( filter ) => filter.isVisible );

	const hasVisibleFilters = !! visibleFilters.length;
	if ( filters.length === 0 ) {
		return null;
	}

	const addFilterButtonProps = {
		label: __( 'Add filter' ),
		'aria-expanded': false,
		isPressed: false,
	};
	const toggleFiltersButtonProps = {
		label: _x( 'Filter', 'verb' ),
		'aria-expanded': isShowingFilter,
		isPressed: isShowingFilter,
		onClick: () => {
			if ( ! isShowingFilter ) {
				setOpenedFilter( null );
			}
			setIsShowingFilter( ! isShowingFilter );
		},
	};
	const buttonComponent = (
		<Button
			ref={ buttonRef }
			className="dataviews-filters__visibility-toggle"
			size="compact"
			icon={ funnel }
			{ ...( hasVisibleFilters
				? toggleFiltersButtonProps
				: addFilterButtonProps ) }
		/>
	);
	return (
		<div className="dataviews-filters__container-visibility-toggle">
			{ ! hasVisibleFilters ? (
				<AddFilterMenu
					filters={ filters }
					view={ view }
					onChangeView={ onChangeViewWithFilterVisibility }
					setOpenedFilter={ setOpenedFilter }
					triggerProps={ { render: buttonComponent } }
				/>
			) : (
				<FilterVisibilityToggle
					buttonRef={ buttonRef }
					filtersCount={ view.filters?.length }
				>
					{ buttonComponent }
				</FilterVisibilityToggle>
			) }
		</div>
	);
}

function FilterVisibilityToggle( {
	buttonRef,
	filtersCount,
	children,
}: {
	buttonRef: React.RefObject< HTMLButtonElement >;
	filtersCount?: number;
	children: React.ReactNode;
} ) {
	// Focus the `add filter` button when unmounts.
	useEffect(
		() => () => {
			buttonRef.current?.focus();
		},
		[ buttonRef ]
	);
	return (
		<>
			{ children }
			{ !! filtersCount && (
				<span className="dataviews-filters-toggle__count">
					{ filtersCount }
				</span>
			) }
		</>
	);
}

function Filters() {
	const { fields, view, onChangeView, openedFilter, setOpenedFilter } =
		useContext( DataViewsContext );
	const addFilterRef = useRef< HTMLButtonElement >( null );
	const filters = useFilters( fields, view );
	const addFilter = (
		<AddFilter
			key="add-filter"
			filters={ filters }
			view={ view }
			onChangeView={ onChangeView }
			ref={ addFilterRef }
			setOpenedFilter={ setOpenedFilter }
		/>
	);
	const visibleFilters = filters.filter( ( filter ) => filter.isVisible );
	if ( visibleFilters.length === 0 ) {
		return null;
	}
	const filterComponents = [
		...visibleFilters.map( ( filter ) => {
			return (
				<FilterSummary
					key={ filter.field }
					filter={ filter }
					view={ view }
					onChangeView={ onChangeView }
					addFilterRef={ addFilterRef }
					openedFilter={ openedFilter }
				/>
			);
		} ),
		addFilter,
	];

	filterComponents.push(
		<ResetFilters
			key="reset-filters"
			filters={ filters }
			view={ view }
			onChangeView={ onChangeView }
		/>
	);

	return (
		<HStack
			justify="flex-start"
			style={ { width: 'fit-content' } }
			className="dataviews-filters__container"
			wrap
		>
			{ filterComponents }
		</HStack>
	);
}

export default memo( Filters );
