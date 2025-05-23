/**
 * External dependencies
 */
import clsx from 'clsx';
import type { RefObject } from 'react';

/**
 * WordPress dependencies
 */
import {
	Dropdown,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	FlexItem,
	SelectControl,
	Tooltip,
	Icon,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useRef, createInterpolateElement } from '@wordpress/element';
import { closeSmall } from '@wordpress/icons';

const ENTER = 'Enter';
const SPACE = ' ';

/**
 * Internal dependencies
 */
import SearchWidget from './search-widget';
import InputWidget from './input-widget';
import {
	ALL_OPERATORS,
	OPERATOR_IS,
	OPERATOR_IS_NOT,
	OPERATOR_IS_ANY,
	OPERATOR_IS_NONE,
	OPERATOR_IS_ALL,
	OPERATOR_IS_NOT_ALL,
	OPERATOR_LESS_THAN,
	OPERATOR_GREATER_THAN,
	OPERATOR_LESS_THAN_OR_EQUAL,
	OPERATOR_GREATER_THAN_OR_EQUAL,
	OPERATOR_CONTAINS,
	OPERATOR_NOT_CONTAINS,
	OPERATOR_STARTS_WITH,
} from '../../constants';
import type {
	Filter,
	NormalizedFilter,
	Operator,
	Option,
	View,
	NormalizedField,
} from '../../types';

interface FilterTextProps {
	activeElements: Option[];
	filterInView?: Filter;
	filter: NormalizedFilter;
}

interface OperatorSelectorProps {
	filter: NormalizedFilter;
	view: View;
	onChangeView: ( view: View ) => void;
}

interface FilterProps extends OperatorSelectorProps {
	addFilterRef: RefObject< HTMLButtonElement >;
	openedFilter: string | null;
	fields: NormalizedField< any >[];
}

const FilterText = ( {
	activeElements,
	filterInView,
	filter,
}: FilterTextProps ) => {
	if ( activeElements === undefined || activeElements.length === 0 ) {
		return filter.name;
	}

	const filterTextWrappers = {
		Name: <span className="dataviews-filters__summary-filter-text-name" />,
		Value: (
			<span className="dataviews-filters__summary-filter-text-value" />
		),
	};

	if (
		! filterInView?.operator ||
		! ALL_OPERATORS.includes( filterInView.operator )
	) {
		return sprintf(
			/* translators: 1: Filter name e.g.: "Unknown status for Author". */
			__( 'Unknown status for %1$s' ),
			filter.name
		);
	}

	const operatorLabel =
		filter.operators.find(
			( operator ) => operator.name === filterInView?.operator
		)?.label || filterInView.operator;

	return createInterpolateElement(
		sprintf(
			// 'Name' is the field name, 'Operator' is the operator label, and 'Value' is the filter value.
			// e.g.: "Author is any: Admin, Editor".
			'<Name>%1$s %2$s: </Name><Value>%3$s</Value>',
			filter.name,
			operatorLabel?.toLowerCase(),
			activeElements.map( ( element ) => element.label ).join( ', ' )
		),
		filterTextWrappers
	);
};

function OperatorSelector( {
	filter,
	view,
	onChangeView,
}: OperatorSelectorProps ) {
	const operatorOptions = filter.operators?.map( ( operator ) => ( {
		value: operator.name,
		label: operator.label,
	} ) );
	const currentFilter = view.filters?.find(
		( _filter ) => _filter.field === filter.field
	);
	const value = currentFilter?.operator || filter.operators[ 0 ].name;
	return (
		operatorOptions.length > 1 && (
			<HStack
				spacing={ 2 }
				justify="flex-start"
				className="dataviews-filters__summary-operators-container"
			>
				<FlexItem className="dataviews-filters__summary-operators-filter-name">
					{ filter.name }
				</FlexItem>

				<SelectControl
					className="dataviews-filters__summary-operators-filter-select"
					label={ __( 'Conditions' ) }
					value={ value }
					options={ operatorOptions }
					onChange={ ( newValue ) => {
						const operator = newValue as Operator;
						const newFilters = currentFilter
							? [
									...( view.filters ?? [] ).map(
										( _filter ) => {
											if (
												_filter.field === filter.field
											) {
												return {
													..._filter,
													operator,
												};
											}
											return _filter;
										}
									),
							  ]
							: [
									...( view.filters ?? [] ),
									{
										field: filter.field,
										operator,
										value: undefined,
									},
							  ];
						onChangeView( {
							...view,
							page: 1,
							filters: newFilters,
						} );
					} }
					size="small"
					variant="minimal"
					__nextHasNoMarginBottom
					hideLabelFromVision
				/>
			</HStack>
		)
	);
}

export default function Filter( {
	addFilterRef,
	openedFilter,
	fields,
	...commonProps
}: FilterProps ) {
	const toggleRef = useRef< HTMLDivElement >( null );
	const { filter, view, onChangeView } = commonProps;
	const filterInView = view.filters?.find(
		( f ) => f.field === filter.field
	);

	let activeElements: Option[] = [];

	if ( filter.elements.length > 0 ) {
		activeElements = filter.elements.filter( ( element ) => {
			if ( filter.singleSelection ) {
				return element.value === filterInView?.value;
			}
			return filterInView?.value?.includes( element.value );
		} );
	} else if ( filterInView?.value !== undefined ) {
		activeElements = [
			{
				value: filterInView.value,
				label: filterInView.value,
			},
		];
	}

	const isPrimary = filter.isPrimary;
	const hasValues = filterInView?.value !== undefined;
	const canResetOrRemove = ! isPrimary || hasValues;
	return (
		<Dropdown
			defaultOpen={ openedFilter === filter.field }
			contentClassName="dataviews-filters__summary-popover"
			popoverProps={ { placement: 'bottom-start', role: 'dialog' } }
			onClose={ () => {
				toggleRef.current?.focus();
			} }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<div className="dataviews-filters__summary-chip-container">
					<Tooltip
						text={ sprintf(
							/* translators: 1: Filter name. */
							__( 'Filter by: %1$s' ),
							filter.name.toLowerCase()
						) }
						placement="top"
					>
						<div
							className={ clsx(
								'dataviews-filters__summary-chip',
								{
									'has-reset': canResetOrRemove,
									'has-values': hasValues,
								}
							) }
							role="button"
							tabIndex={ 0 }
							onClick={ onToggle }
							onKeyDown={ ( event ) => {
								if ( [ ENTER, SPACE ].includes( event.key ) ) {
									onToggle();
									event.preventDefault();
								}
							} }
							aria-pressed={ isOpen }
							aria-expanded={ isOpen }
							ref={ toggleRef }
						>
							<FilterText
								activeElements={ activeElements }
								filterInView={ filterInView }
								filter={ filter }
							/>
						</div>
					</Tooltip>
					{ canResetOrRemove && (
						<Tooltip
							text={ isPrimary ? __( 'Reset' ) : __( 'Remove' ) }
							placement="top"
						>
							<button
								className={ clsx(
									'dataviews-filters__summary-chip-remove',
									{ 'has-values': hasValues }
								) }
								onClick={ () => {
									onChangeView( {
										...view,
										page: 1,
										filters: view.filters?.filter(
											( _filter ) =>
												_filter.field !== filter.field
										),
									} );
									// If the filter is not primary and can be removed, it will be added
									// back to the available filters from `Add filter` component.
									if ( ! isPrimary ) {
										addFilterRef.current?.focus();
									} else {
										// If is primary, focus the toggle button.
										toggleRef.current?.focus();
									}
								} }
							>
								<Icon icon={ closeSmall } />
							</button>
						</Tooltip>
					) }
				</div>
			) }
			renderContent={ () => {
				return (
					<VStack spacing={ 0 } justify="flex-start">
						<OperatorSelector { ...commonProps } />
						{ commonProps.filter.elements.length > 0 ? (
							<SearchWidget
								{ ...commonProps }
								filter={ {
									...commonProps.filter,
									elements: commonProps.filter.elements,
								} }
							/>
						) : (
							<InputWidget { ...commonProps } fields={ fields } />
						) }
					</VStack>
				);
			} }
		/>
	);
}
