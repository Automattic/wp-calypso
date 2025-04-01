/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { useInstanceId, usePrevious } from '@wordpress/compose';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	privateApis as componentsPrivateApis,
	Spinner,
	VisuallyHidden,
	Composite,
} from '@wordpress/components';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { useRegistry } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import {
	ActionsMenuGroup,
	ActionModal,
} from '../../components/dataviews-item-actions';
import type {
	Action,
	NormalizedField,
	ViewList as ViewListType,
	ViewListProps,
	ActionModal as ActionModalType,
} from '../../types';

interface ListViewItemProps< Item > {
	view: ViewListType;
	actions: Action< Item >[];
	idPrefix: string;
	isSelected: boolean;
	item: Item;
	titleField?: NormalizedField< Item >;
	mediaField?: NormalizedField< Item >;
	descriptionField?: NormalizedField< Item >;
	onSelect: ( item: Item ) => void;
	otherFields: NormalizedField< Item >[];
	onDropdownTriggerKeyDown: React.KeyboardEventHandler< HTMLButtonElement >;
}

const { Menu } = unlock( componentsPrivateApis );

function generateItemWrapperCompositeId( idPrefix: string ) {
	return `${ idPrefix }-item-wrapper`;
}
function generatePrimaryActionCompositeId(
	idPrefix: string,
	primaryActionId: string
) {
	return `${ idPrefix }-primary-action-${ primaryActionId }`;
}
function generateDropdownTriggerCompositeId( idPrefix: string ) {
	return `${ idPrefix }-dropdown`;
}

function PrimaryActionGridCell< Item >( {
	idPrefix,
	primaryAction,
	item,
}: {
	idPrefix: string;
	primaryAction: Action< Item >;
	item: Item;
} ) {
	const registry = useRegistry();
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const compositeItemId = generatePrimaryActionCompositeId(
		idPrefix,
		primaryAction.id
	);

	const label =
		typeof primaryAction.label === 'string'
			? primaryAction.label
			: primaryAction.label( [ item ] );

	return 'RenderModal' in primaryAction ? (
		<div role="gridcell" key={ primaryAction.id }>
			<Composite.Item
				id={ compositeItemId }
				render={
					<Button
						label={ label }
						disabled={ !! primaryAction.disabled }
						accessibleWhenDisabled
						icon={ primaryAction.icon }
						isDestructive={ primaryAction.isDestructive }
						size="small"
						onClick={ () => setIsModalOpen( true ) }
					/>
				}
			>
				{ isModalOpen && (
					<ActionModal< Item >
						action={ primaryAction }
						items={ [ item ] }
						closeModal={ () => setIsModalOpen( false ) }
					/>
				) }
			</Composite.Item>
		</div>
	) : (
		<div role="gridcell" key={ primaryAction.id }>
			<Composite.Item
				id={ compositeItemId }
				render={
					<Button
						label={ label }
						disabled={ !! primaryAction.disabled }
						accessibleWhenDisabled
						icon={ primaryAction.icon }
						isDestructive={ primaryAction.isDestructive }
						size="small"
						onClick={ () => {
							primaryAction.callback( [ item ], { registry } );
						} }
					/>
				}
			/>
		</div>
	);
}

function ListItem< Item >( {
	view,
	actions,
	idPrefix,
	isSelected,
	item,
	titleField,
	mediaField,
	descriptionField,
	onSelect,
	otherFields,
	onDropdownTriggerKeyDown,
}: ListViewItemProps< Item > ) {
	const { showTitle = true, showMedia = true, showDescription = true } = view;
	const itemRef = useRef< HTMLDivElement >( null );
	const labelId = `${ idPrefix }-label`;
	const descriptionId = `${ idPrefix }-description`;

	const registry = useRegistry();
	const [ isHovered, setIsHovered ] = useState( false );
	const [ activeModalAction, setActiveModalAction ] = useState(
		null as ActionModalType< Item > | null
	);
	const handleHover: React.MouseEventHandler = ( { type } ) => {
		const isHover = type === 'mouseenter';
		setIsHovered( isHover );
	};

	useEffect( () => {
		if ( isSelected ) {
			itemRef.current?.scrollIntoView( {
				behavior: 'auto',
				block: 'nearest',
				inline: 'nearest',
			} );
		}
	}, [ isSelected ] );

	const { primaryAction, eligibleActions } = useMemo( () => {
		// If an action is eligible for all items, doesn't need
		// to provide the `isEligible` function.
		const _eligibleActions = actions.filter(
			( action ) => ! action.isEligible || action.isEligible( item )
		);
		const _primaryActions = _eligibleActions.filter(
			( action ) => action.isPrimary && !! action.icon
		);
		return {
			primaryAction: _primaryActions[ 0 ],
			eligibleActions: _eligibleActions,
		};
	}, [ actions, item ] );

	const hasOnlyOnePrimaryAction = primaryAction && actions.length === 1;

	const renderedMediaField =
		showMedia && mediaField?.render ? (
			<div className="dataviews-view-list__media-wrapper">
				<mediaField.render item={ item } />
			</div>
		) : null;

	const renderedTitleField =
		showTitle && titleField?.render ? (
			<titleField.render item={ item } />
		) : null;

	const usedActions = eligibleActions?.length > 0 && (
		<HStack spacing={ 3 } className="dataviews-view-list__item-actions">
			{ primaryAction && (
				<PrimaryActionGridCell
					idPrefix={ idPrefix }
					primaryAction={ primaryAction }
					item={ item }
				/>
			) }
			{ ! hasOnlyOnePrimaryAction && (
				<div role="gridcell">
					<Menu placement="bottom-end">
						<Menu.TriggerButton
							render={
								<Composite.Item
									id={ generateDropdownTriggerCompositeId(
										idPrefix
									) }
									render={
										<Button
											size="small"
											icon={ moreVertical }
											label={ __( 'Actions' ) }
											accessibleWhenDisabled
											disabled={ ! actions.length }
											onKeyDown={
												onDropdownTriggerKeyDown
											}
										/>
									}
								/>
							}
						/>
						<Menu.Popover>
							<ActionsMenuGroup
								actions={ eligibleActions }
								item={ item }
								registry={ registry }
								setActiveModalAction={ setActiveModalAction }
							/>
						</Menu.Popover>
					</Menu>
					{ !! activeModalAction && (
						<ActionModal
							action={ activeModalAction }
							items={ [ item ] }
							closeModal={ () => setActiveModalAction( null ) }
						/>
					) }
				</div>
			) }
		</HStack>
	);

	return (
		<Composite.Row
			ref={ itemRef }
			render={ <div /> }
			role="row"
			className={ clsx( {
				'is-selected': isSelected,
				'is-hovered': isHovered,
			} ) }
			onMouseEnter={ handleHover }
			onMouseLeave={ handleHover }
		>
			<HStack className="dataviews-view-list__item-wrapper" spacing={ 0 }>
				<div role="gridcell">
					<Composite.Item
						id={ generateItemWrapperCompositeId( idPrefix ) }
						aria-pressed={ isSelected }
						aria-labelledby={ labelId }
						aria-describedby={ descriptionId }
						className="dataviews-view-list__item"
						onClick={ () => onSelect( item ) }
					/>
				</div>
				<HStack spacing={ 3 } justify="start" alignment="flex-start">
					{ renderedMediaField }
					<VStack
						spacing={ 1 }
						className="dataviews-view-list__field-wrapper"
					>
						<HStack spacing={ 0 }>
							<div
								className="dataviews-title-field"
								id={ labelId }
							>
								{ renderedTitleField }
							</div>
							{ usedActions }
						</HStack>
						{ showDescription && descriptionField?.render && (
							<div className="dataviews-view-list__field">
								<descriptionField.render item={ item } />
							</div>
						) }
						<div
							className="dataviews-view-list__fields"
							id={ descriptionId }
						>
							{ otherFields.map( ( field ) => (
								<div
									key={ field.id }
									className="dataviews-view-list__field"
								>
									<VisuallyHidden
										as="span"
										className="dataviews-view-list__field-label"
									>
										{ field.label }
									</VisuallyHidden>
									<span className="dataviews-view-list__field-value">
										<field.render item={ item } />
									</span>
								</div>
							) ) }
						</div>
					</VStack>
				</HStack>
			</HStack>
		</Composite.Row>
	);
}

function isDefined< T >( item: T | undefined ): item is T {
	return !! item;
}

export default function ViewList< Item >( props: ViewListProps< Item > ) {
	const {
		actions,
		data,
		fields,
		getItemId,
		isLoading,
		onChangeSelection,
		selection,
		view,
	} = props;
	const baseId = useInstanceId( ViewList, 'view-list' );

	const selectedItem = data?.findLast( ( item ) =>
		selection.includes( getItemId( item ) )
	);
	const titleField = fields.find( ( field ) => field.id === view.titleField );
	const mediaField = fields.find( ( field ) => field.id === view.mediaField );
	const descriptionField = fields.find(
		( field ) => field.id === view.descriptionField
	);
	const otherFields = ( view?.fields ?? [] )
		.map( ( fieldId ) => fields.find( ( f ) => fieldId === f.id ) )
		.filter( isDefined );

	const onSelect = ( item: Item ) =>
		onChangeSelection( [ getItemId( item ) ] );

	const generateCompositeItemIdPrefix = useCallback(
		( item: Item ) => `${ baseId }-${ getItemId( item ) }`,
		[ baseId, getItemId ]
	);

	const isActiveCompositeItem = useCallback(
		( item: Item, idToCheck: string ) => {
			// All composite items use the same prefix in their IDs.
			return idToCheck.startsWith(
				generateCompositeItemIdPrefix( item )
			);
		},
		[ generateCompositeItemIdPrefix ]
	);

	// Controlled state for the active composite item.
	const [ activeCompositeId, setActiveCompositeId ] = useState<
		string | null | undefined
	>( undefined );

	// Update the active composite item when the selected item changes.
	useEffect( () => {
		if ( selectedItem ) {
			setActiveCompositeId(
				generateItemWrapperCompositeId(
					generateCompositeItemIdPrefix( selectedItem )
				)
			);
		}
	}, [ selectedItem, generateCompositeItemIdPrefix ] );

	const activeItemIndex = data.findIndex( ( item ) =>
		isActiveCompositeItem( item, activeCompositeId ?? '' )
	);
	const previousActiveItemIndex = usePrevious( activeItemIndex );
	const isActiveIdInList = activeItemIndex !== -1;

	const selectCompositeItem = useCallback(
		(
			targetIndex: number,
			// Allows invokers to specify a custom function to generate the
			// target composite item ID
			generateCompositeId: ( idPrefix: string ) => string
		) => {
			// Clamping between 0 and data.length - 1 to avoid out of bounds.
			const clampedIndex = Math.min(
				data.length - 1,
				Math.max( 0, targetIndex )
			);
			if ( ! data[ clampedIndex ] ) {
				return;
			}
			const itemIdPrefix = generateCompositeItemIdPrefix(
				data[ clampedIndex ]
			);
			const targetCompositeItemId = generateCompositeId( itemIdPrefix );

			setActiveCompositeId( targetCompositeItemId );
			document.getElementById( targetCompositeItemId )?.focus();
		},
		[ data, generateCompositeItemIdPrefix ]
	);

	// Select a new active composite item when the current active item
	// is removed from the list.
	useEffect( () => {
		const wasActiveIdInList =
			previousActiveItemIndex !== undefined &&
			previousActiveItemIndex !== -1;
		if ( ! isActiveIdInList && wasActiveIdInList ) {
			// By picking `previousActiveItemIndex` as the next item index, we are
			// basically picking the item that would have been after the deleted one.
			// If the previously active (and removed) item was the last of the list,
			// we will select the item before it — which is the new last item.
			selectCompositeItem(
				previousActiveItemIndex,
				generateItemWrapperCompositeId
			);
		}
	}, [ isActiveIdInList, selectCompositeItem, previousActiveItemIndex ] );

	// Prevent the default behavior (open dropdown menu) and instead select the
	// dropdown menu trigger on the previous/next row.
	// https://github.com/ariakit/ariakit/issues/3768
	const onDropdownTriggerKeyDown = useCallback(
		( event: React.KeyboardEvent< HTMLButtonElement > ) => {
			if ( event.key === 'ArrowDown' ) {
				// Select the dropdown menu trigger item in the next row.
				event.preventDefault();
				selectCompositeItem(
					activeItemIndex + 1,
					generateDropdownTriggerCompositeId
				);
			}
			if ( event.key === 'ArrowUp' ) {
				// Select the dropdown menu trigger item in the previous row.
				event.preventDefault();
				selectCompositeItem(
					activeItemIndex - 1,
					generateDropdownTriggerCompositeId
				);
			}
		},
		[ selectCompositeItem, activeItemIndex ]
	);

	const hasData = data?.length;
	if ( ! hasData ) {
		return (
			<div
				className={ clsx( {
					'dataviews-loading': isLoading,
					'dataviews-no-results': ! hasData && ! isLoading,
				} ) }
			>
				{ ! hasData && (
					<p>{ isLoading ? <Spinner /> : __( 'No results' ) }</p>
				) }
			</div>
		);
	}

	return (
		<Composite
			id={ baseId }
			render={ <div /> }
			className="dataviews-view-list"
			role="grid"
			activeId={ activeCompositeId }
			setActiveId={ setActiveCompositeId }
		>
			{ data.map( ( item ) => {
				const id = generateCompositeItemIdPrefix( item );
				return (
					<ListItem
						key={ id }
						view={ view }
						idPrefix={ id }
						actions={ actions }
						item={ item }
						isSelected={ item === selectedItem }
						onSelect={ onSelect }
						mediaField={ mediaField }
						titleField={ titleField }
						descriptionField={ descriptionField }
						otherFields={ otherFields }
						onDropdownTriggerKeyDown={ onDropdownTriggerKeyDown }
					/>
				);
			} ) }
		</Composite>
	);
}
