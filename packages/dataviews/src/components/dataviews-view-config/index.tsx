/**
 * External dependencies
 */
import type { ChangeEvent, ReactNode } from 'react';
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	Button,
	__experimentalDropdownContentWrapper as DropdownContentWrapper,
	Dropdown,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	SelectControl,
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	privateApis as componentsPrivateApis,
	BaseControl,
	Icon,
} from '@wordpress/components';
import { __, _x, sprintf } from '@wordpress/i18n';
import { memo, useContext, useMemo, useState } from '@wordpress/element';
import {
	chevronDown,
	chevronUp,
	cog,
	seen,
	unseen,
	lock,
	moreVertical,
} from '@wordpress/icons';
import warning from '@wordpress/warning';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { SORTING_DIRECTIONS, sortIcons, sortLabels } from '../../constants';
import { VIEW_LAYOUTS } from '../../dataviews-layouts';
import type { NormalizedField, SupportedLayouts, View } from '../../types';
import DataViewsContext from '../dataviews-context';
import { unlock } from '../../lock-unlock';

const { Menu } = unlock( componentsPrivateApis );

interface ViewTypeMenuProps {
	defaultLayouts?: SupportedLayouts;
}

const DATAVIEWS_CONFIG_POPOVER_PROPS = {
	className: 'dataviews-config__popover',
	placement: 'bottom-end',
	offset: 9,
};

export function ViewTypeMenu() {
	const { view, onChangeView, defaultLayouts } =
		useContext( DataViewsContext );
	const availableLayouts = Object.keys( defaultLayouts );
	if ( availableLayouts.length <= 1 ) {
		return null;
	}
	const activeView = VIEW_LAYOUTS.find( ( v ) => view.type === v.type );
	return (
		<Menu>
			<Menu.TriggerButton
				render={
					<Button
						size="compact"
						icon={ activeView?.icon }
						label={ __( 'Layout' ) }
					/>
				}
			/>
			<Menu.Popover>
				{ availableLayouts.map( ( layout ) => {
					const config = VIEW_LAYOUTS.find(
						( v ) => v.type === layout
					);
					if ( ! config ) {
						return null;
					}
					return (
						<Menu.RadioItem
							key={ layout }
							value={ layout }
							name="view-actions-available-view"
							checked={ layout === view.type }
							hideOnClick
							onChange={ (
								e: ChangeEvent< HTMLInputElement >
							) => {
								switch ( e.target.value ) {
									case 'list':
									case 'grid':
									case 'table':
										const viewWithoutLayout = { ...view };
										if ( 'layout' in viewWithoutLayout ) {
											delete viewWithoutLayout.layout;
										}
										// @ts-expect-error
										return onChangeView( {
											...viewWithoutLayout,
											type: e.target.value,
											...defaultLayouts[ e.target.value ],
										} );
								}
								warning( 'Invalid dataview' );
							} }
						>
							<Menu.ItemLabel>{ config.label }</Menu.ItemLabel>
						</Menu.RadioItem>
					);
				} ) }
			</Menu.Popover>
		</Menu>
	);
}

function SortFieldControl() {
	const { view, fields, onChangeView } = useContext( DataViewsContext );
	const orderOptions = useMemo( () => {
		const sortableFields = fields.filter(
			( field ) => field.enableSorting !== false
		);
		return sortableFields.map( ( field ) => {
			return {
				label: field.label,
				value: field.id,
			};
		} );
	}, [ fields ] );

	return (
		<SelectControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			label={ __( 'Sort by' ) }
			value={ view.sort?.field }
			options={ orderOptions }
			onChange={ ( value: string ) => {
				onChangeView( {
					...view,
					sort: {
						direction: view?.sort?.direction || 'desc',
						field: value,
					},
					showLevels: false,
				} );
			} }
		/>
	);
}

function SortDirectionControl() {
	const { view, fields, onChangeView } = useContext( DataViewsContext );

	const sortableFields = fields.filter(
		( field ) => field.enableSorting !== false
	);
	if ( sortableFields.length === 0 ) {
		return null;
	}

	let value = view.sort?.direction;
	if ( ! value && view.sort?.field ) {
		value = 'desc';
	}
	return (
		<ToggleGroupControl
			className="dataviews-view-config__sort-direction"
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			isBlock
			label={ __( 'Order' ) }
			value={ value }
			onChange={ ( newDirection ) => {
				if ( newDirection === 'asc' || newDirection === 'desc' ) {
					onChangeView( {
						...view,
						sort: {
							direction: newDirection,
							field:
								view.sort?.field ||
								// If there is no field assigned as the sorting field assign the first sortable field.
								fields.find(
									( field ) => field.enableSorting !== false
								)?.id ||
								'',
						},
						showLevels: false,
					} );
					return;
				}
				warning( 'Invalid direction' );
			} }
		>
			{ SORTING_DIRECTIONS.map( ( direction ) => {
				return (
					<ToggleGroupControlOptionIcon
						key={ direction }
						value={ direction }
						icon={ sortIcons[ direction ] }
						label={ sortLabels[ direction ] }
					/>
				);
			} ) }
		</ToggleGroupControl>
	);
}

const PAGE_SIZE_VALUES = [ 10, 20, 50, 100 ];
function ItemsPerPageControl() {
	const { view, onChangeView } = useContext( DataViewsContext );
	return (
		<ToggleGroupControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			isBlock
			label={ __( 'Items per page' ) }
			value={ view.perPage || 10 }
			disabled={ ! view?.sort?.field }
			onChange={ ( newItemsPerPage ) => {
				const newItemsPerPageNumber =
					typeof newItemsPerPage === 'number' ||
					newItemsPerPage === undefined
						? newItemsPerPage
						: parseInt( newItemsPerPage, 10 );
				onChangeView( {
					...view,
					perPage: newItemsPerPageNumber,
					page: 1,
				} );
			} }
		>
			{ PAGE_SIZE_VALUES.map( ( value ) => {
				return (
					<ToggleGroupControlOption
						key={ value }
						value={ value }
						label={ value.toString() }
					/>
				);
			} ) }
		</ToggleGroupControl>
	);
}

function PreviewOptions( {
	previewOptions,
	onChangePreviewOption,
	onMenuOpenChange,
	activeOption,
}: {
	previewOptions?: Array< { label: string; id: string } >;
	onChangePreviewOption?: ( newPreviewOption: string ) => void;
	onMenuOpenChange: ( isOpen: boolean ) => void;
	activeOption?: string;
} ) {
	const focusPreviewOptionsField = ( id: string ) => {
		// Focus the visibility button to avoid focus loss.
		// Our code is safe against the component being unmounted, so we don't need to worry about cleaning the timeout.
		// eslint-disable-next-line @wordpress/react-no-unsafe-timeout
		setTimeout( () => {
			const element = document.querySelector(
				`.dataviews-field-control__field-${ id } .dataviews-field-control__field-preview-options-button`
			);
			if ( element instanceof HTMLElement ) {
				element.focus();
			}
		}, 50 );
	};
	return (
		<Menu onOpenChange={ onMenuOpenChange }>
			<Menu.TriggerButton
				render={
					<Button
						className="dataviews-field-control__field-preview-options-button"
						size="compact"
						icon={ moreVertical }
						label={ __( 'Preview' ) }
					/>
				}
			/>
			<Menu.Popover>
				{ previewOptions?.map( ( { id, label } ) => {
					return (
						<Menu.RadioItem
							key={ id }
							value={ id }
							checked={ id === activeOption }
							onChange={ () => {
								onChangePreviewOption?.( id );
								focusPreviewOptionsField( id );
							} }
						>
							<Menu.ItemLabel>{ label }</Menu.ItemLabel>
						</Menu.RadioItem>
					);
				} ) }
			</Menu.Popover>
		</Menu>
	);
}
function FieldItem( {
	field,
	label,
	description,
	isVisible,
	isFirst,
	isLast,
	canMove = true,
	onToggleVisibility,
	onMoveUp,
	onMoveDown,
	previewOptions,
	onChangePreviewOption,
}: {
	field: NormalizedField< any >;
	label?: string;
	description?: string;
	isVisible: boolean;
	isFirst?: boolean;
	isLast?: boolean;
	canMove?: boolean;
	onToggleVisibility?: () => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	previewOptions?: Array< { label: string; id: string } >;
	onChangePreviewOption?: ( newPreviewOption: string ) => void;
} ) {
	const [ isChangingPreviewOption, setIsChangingPreviewOption ] =
		useState< boolean >( false );

	const focusVisibilityField = () => {
		// Focus the visibility button to avoid focus loss.
		// Our code is safe against the component being unmounted, so we don't need to worry about cleaning the timeout.
		// eslint-disable-next-line @wordpress/react-no-unsafe-timeout
		setTimeout( () => {
			const element = document.querySelector(
				`.dataviews-field-control__field-${ field.id } .dataviews-field-control__field-visibility-button`
			);
			if ( element instanceof HTMLElement ) {
				element.focus();
			}
		}, 50 );
	};

	return (
		<Item>
			<HStack
				expanded
				className={ clsx(
					'dataviews-field-control__field',
					`dataviews-field-control__field-${ field.id }`,
					// The actions are hidden when the mouse is not hovering the item, or focus
					// is outside the item.
					// For actions that require a popover, a menu etc, that would mean that when the interactive element
					// opens and the focus goes there the actions would be hidden.
					// To avoid that we add a class to the item, that makes sure actions are visible while there is some
					// interaction with the item.
					{ 'is-interacting': isChangingPreviewOption }
				) }
				justify="flex-start"
			>
				<span className="dataviews-field-control__icon">
					{ ! canMove && ! field.enableHiding && (
						<Icon icon={ lock } />
					) }
				</span>
				<span className="dataviews-field-control__label-sub-label-container">
					<span className="dataviews-field-control__label">
						{ label || field.label }
					</span>
					{ description && (
						<span className="dataviews-field-control__sub-label">
							{ description }
						</span>
					) }
				</span>
				<HStack
					justify="flex-end"
					expanded={ false }
					className="dataviews-field-control__actions"
				>
					{ isVisible && (
						<>
							<Button
								disabled={ isFirst || ! canMove }
								accessibleWhenDisabled
								size="compact"
								onClick={ onMoveUp }
								icon={ chevronUp }
								label={
									isFirst || ! canMove
										? __( "This field can't be moved up" )
										: sprintf(
												/* translators: %s: field label */
												__( 'Move %s up' ),
												field.label
										  )
								}
							/>
							<Button
								disabled={ isLast || ! canMove }
								accessibleWhenDisabled
								size="compact"
								onClick={ onMoveDown }
								icon={ chevronDown }
								label={
									isLast || ! canMove
										? __( "This field can't be moved down" )
										: sprintf(
												/* translators: %s: field label */
												__( 'Move %s down' ),
												field.label
										  )
								}
							/>
						</>
					) }
					{ onToggleVisibility && (
						<Button
							className="dataviews-field-control__field-visibility-button"
							disabled={ ! field.enableHiding }
							accessibleWhenDisabled
							size="compact"
							onClick={ () => {
								onToggleVisibility();
								focusVisibilityField();
							} }
							icon={ isVisible ? unseen : seen }
							label={
								isVisible
									? sprintf(
											/* translators: %s: field label */
											_x( 'Hide %s', 'field' ),
											field.label
									  )
									: sprintf(
											/* translators: %s: field label */
											_x( 'Show %s', 'field' ),
											field.label
									  )
							}
						/>
					) }
					{ previewOptions && (
						<PreviewOptions
							previewOptions={ previewOptions }
							onChangePreviewOption={ onChangePreviewOption }
							onMenuOpenChange={ setIsChangingPreviewOption }
							activeOption={ field.id }
						/>
					) }
				</HStack>
			</HStack>
		</Item>
	);
}

function RegularFieldItem( {
	index,
	field,
	view,
	onChangeView,
}: {
	index?: number;
	field: NormalizedField< any >;
	view: View;
	onChangeView: ( view: View ) => void;
} ) {
	const visibleFieldIds = view.fields ?? [];
	const isVisible =
		index !== undefined && visibleFieldIds.includes( field.id );

	return (
		<FieldItem
			field={ field }
			isVisible={ isVisible }
			isFirst={ index !== undefined && index < 1 }
			isLast={
				index !== undefined && index === visibleFieldIds.length - 1
			}
			onToggleVisibility={ () => {
				onChangeView( {
					...view,
					fields: isVisible
						? visibleFieldIds.filter(
								( fieldId ) => fieldId !== field.id
						  )
						: [ ...visibleFieldIds, field.id ],
				} );
			} }
			onMoveUp={
				index !== undefined
					? () => {
							onChangeView( {
								...view,
								fields: [
									...( visibleFieldIds.slice(
										0,
										index - 1
									) ?? [] ),
									field.id,
									visibleFieldIds[ index - 1 ],
									...visibleFieldIds.slice( index + 1 ),
								],
							} );
					  }
					: undefined
			}
			onMoveDown={
				index !== undefined
					? () => {
							onChangeView( {
								...view,
								fields: [
									...( visibleFieldIds.slice( 0, index ) ??
										[] ),
									visibleFieldIds[ index + 1 ],
									field.id,
									...visibleFieldIds.slice( index + 2 ),
								],
							} );
					  }
					: undefined
			}
		/>
	);
}

function isDefined< T >( item: T | undefined ): item is T {
	return !! item;
}

function FieldControl() {
	const { view, fields, onChangeView } = useContext( DataViewsContext );

	const togglableFields = [
		view?.titleField,
		view?.mediaField,
		view?.descriptionField,
	].filter( Boolean );
	const visibleFieldIds = view.fields ?? [];
	const hiddenFields = fields.filter(
		( f ) =>
			! visibleFieldIds.includes( f.id ) &&
			! togglableFields.includes( f.id ) &&
			f.type !== 'media'
	);
	const visibleFields = visibleFieldIds
		.map( ( fieldId ) => fields.find( ( f ) => f.id === fieldId ) )
		.filter( isDefined );

	if ( ! visibleFields?.length && ! hiddenFields?.length ) {
		return null;
	}
	const titleField = fields.find( ( f ) => f.id === view.titleField );
	const previewField = fields.find( ( f ) => f.id === view.mediaField );
	const descriptionField = fields.find(
		( f ) => f.id === view.descriptionField
	);

	const previewFields = fields.filter( ( f ) => f.type === 'media' );

	let previewFieldUI;
	if ( previewFields.length > 1 ) {
		const isPreviewFieldVisible =
			isDefined( previewField ) && ( view.showMedia ?? true );
		previewFieldUI = isDefined( previewField ) && (
			<FieldItem
				key={ previewField.id }
				field={ previewField }
				label={ __( 'Preview' ) }
				description={ previewField.label }
				isVisible={ isPreviewFieldVisible }
				onToggleVisibility={ () => {
					onChangeView( {
						...view,
						showMedia: ! isPreviewFieldVisible,
					} );
				} }
				canMove={ false }
				previewOptions={ previewFields.map( ( field ) => ( {
					label: field.label,
					id: field.id,
				} ) ) }
				onChangePreviewOption={ ( newPreviewId ) =>
					onChangeView( { ...view, mediaField: newPreviewId } )
				}
			/>
		);
	}
	const lockedFields = [
		{
			field: titleField,
			isVisibleFlag: 'showTitle',
		},
		{
			field: previewField,
			isVisibleFlag: 'showMedia',
			ui: previewFieldUI,
		},
		{
			field: descriptionField,
			isVisibleFlag: 'showDescription',
		},
	].filter( ( { field } ) => isDefined( field ) );
	const visibleLockedFields = lockedFields.filter(
		( { field, isVisibleFlag } ) =>
			// @ts-expect-error
			isDefined( field ) && ( view[ isVisibleFlag ] ?? true )
	) as Array< {
		field: NormalizedField< any >;
		isVisibleFlag: string;
		ui?: ReactNode;
	} >;
	const hiddenLockedFields = lockedFields.filter(
		( { field, isVisibleFlag } ) =>
			// @ts-expect-error
			isDefined( field ) && ! ( view[ isVisibleFlag ] ?? true )
	) as Array< {
		field: NormalizedField< any >;
		isVisibleFlag: string;
		ui?: ReactNode;
	} >;

	return (
		<VStack className="dataviews-field-control" spacing={ 6 }>
			<VStack className="dataviews-view-config__properties" spacing={ 0 }>
				{ ( visibleLockedFields.length > 0 ||
					!! visibleFields?.length ) && (
					<ItemGroup isBordered isSeparated>
						{ visibleLockedFields.map(
							( { field, isVisibleFlag, ui } ) => {
								return (
									ui ?? (
										<FieldItem
											key={ field.id }
											field={ field }
											isVisible
											onToggleVisibility={ () => {
												onChangeView( {
													...view,
													[ isVisibleFlag ]: false,
												} );
											} }
											canMove={ false }
										/>
									)
								);
							}
						) }

						{ visibleFields.map( ( field, index ) => (
							<RegularFieldItem
								key={ field.id }
								field={ field }
								view={ view }
								onChangeView={ onChangeView }
								index={ index }
							/>
						) ) }
					</ItemGroup>
				) }
			</VStack>

			{ ( !! hiddenFields?.length || !! hiddenLockedFields.length ) && (
				<VStack spacing={ 4 }>
					<BaseControl.VisualLabel style={ { margin: 0 } }>
						{ __( 'Hidden' ) }
					</BaseControl.VisualLabel>
					<VStack
						className="dataviews-view-config__properties"
						spacing={ 0 }
					>
						<ItemGroup isBordered isSeparated>
							{ hiddenLockedFields.length > 0 &&
								hiddenLockedFields.map(
									( { field, isVisibleFlag, ui } ) => {
										return (
											ui ?? (
												<FieldItem
													key={ field.id }
													field={ field }
													isVisible={ false }
													onToggleVisibility={ () => {
														onChangeView( {
															...view,
															[ isVisibleFlag ]:
																true,
														} );
													} }
													canMove={ false }
												/>
											)
										);
									}
								) }
							{ hiddenFields.map( ( field ) => (
								<RegularFieldItem
									key={ field.id }
									field={ field }
									view={ view }
									onChangeView={ onChangeView }
								/>
							) ) }
						</ItemGroup>
					</VStack>
				</VStack>
			) }
		</VStack>
	);
}

function SettingsSection( {
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
} ) {
	return (
		<Grid columns={ 12 } className="dataviews-settings-section" gap={ 4 }>
			<div className="dataviews-settings-section__sidebar">
				<Heading
					level={ 2 }
					className="dataviews-settings-section__title"
				>
					{ title }
				</Heading>
				{ description && (
					<Text
						variant="muted"
						className="dataviews-settings-section__description"
					>
						{ description }
					</Text>
				) }
			</div>
			<Grid
				columns={ 8 }
				gap={ 4 }
				className="dataviews-settings-section__content"
			>
				{ children }
			</Grid>
		</Grid>
	);
}

export function DataviewsViewConfigDropdown() {
	const { view } = useContext( DataViewsContext );
	const popoverId = useInstanceId(
		_DataViewsViewConfig,
		'dataviews-view-config-dropdown'
	);
	const activeLayout = VIEW_LAYOUTS.find(
		( layout ) => layout.type === view.type
	);
	return (
		<Dropdown
			expandOnMobile
			popoverProps={ {
				...DATAVIEWS_CONFIG_POPOVER_PROPS,
				id: popoverId,
			} }
			renderToggle={ ( { onToggle, isOpen } ) => {
				return (
					<Button
						size="compact"
						icon={ cog }
						label={ _x( 'View options', 'View is used as a noun' ) }
						onClick={ onToggle }
						aria-expanded={ isOpen ? 'true' : 'false' }
						aria-controls={ popoverId }
					/>
				);
			} }
			renderContent={ () => (
				<DropdownContentWrapper
					paddingSize="medium"
					className="dataviews-config__popover-content-wrapper"
				>
					<VStack className="dataviews-view-config" spacing={ 6 }>
						<SettingsSection title={ __( 'Appearance' ) }>
							<HStack expanded className="is-divided-in-two">
								<SortFieldControl />
								<SortDirectionControl />
							</HStack>
							{ !! activeLayout?.viewConfigOptions && (
								<activeLayout.viewConfigOptions />
							) }
							<ItemsPerPageControl />
						</SettingsSection>
						<SettingsSection title={ __( 'Properties' ) }>
							<FieldControl />
						</SettingsSection>
					</VStack>
				</DropdownContentWrapper>
			) }
		/>
	);
}

function _DataViewsViewConfig() {
	return (
		<>
			<ViewTypeMenu />
			<DataviewsViewConfigDropdown />
		</>
	);
}

const DataViewsViewConfig = memo( _DataViewsViewConfig );

export default DataViewsViewConfig;
