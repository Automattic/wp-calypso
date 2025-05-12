/**
 * External dependencies
 */
import type { ReactNode, Ref, PropsWithoutRef, RefAttributes } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { arrowLeft, arrowRight, unseen, funnel } from '@wordpress/icons';
import {
	Button,
	Icon,
	privateApis as componentsPrivateApis,
} from '@wordpress/components';
import { forwardRef, Children, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import { sanitizeOperators } from '../../utils';
import { SORTING_DIRECTIONS, sortArrows, sortLabels } from '../../constants';
import type {
	NormalizedField,
	SortDirection,
	ViewTable as ViewTableType,
	Operator,
} from '../../types';

const { Menu } = unlock( componentsPrivateApis );

interface HeaderMenuProps< Item > {
	fieldId: string;
	view: ViewTableType;
	fields: NormalizedField< Item >[];
	onChangeView: ( view: ViewTableType ) => void;
	onHide: ( field: NormalizedField< Item > ) => void;
	setOpenedFilter: ( fieldId: string ) => void;
	canMove?: boolean;
}

function WithMenuSeparators( { children }: { children: ReactNode } ) {
	return Children.toArray( children )
		.filter( Boolean )
		.map( ( child, i ) => (
			<Fragment key={ i }>
				{ i > 0 && <Menu.Separator /> }
				{ child }
			</Fragment>
		) );
}

const _HeaderMenu = forwardRef( function HeaderMenu< Item >(
	{
		fieldId,
		view,
		fields,
		onChangeView,
		onHide,
		setOpenedFilter,
		canMove = true,
	}: HeaderMenuProps< Item >,
	ref: Ref< HTMLButtonElement >
) {
	const visibleFieldIds = view.fields ?? [];
	const index = visibleFieldIds?.indexOf( fieldId ) as number;
	const isSorted = view.sort?.field === fieldId;
	let isHidable = false;
	let isSortable = false;
	let canAddFilter = false;
	let operators: Operator[] = [];
	const field = fields.find( ( f ) => f.id === fieldId );

	if ( ! field ) {
		// No combined or regular field found.
		return null;
	}

	isHidable = field.enableHiding !== false;
	isSortable = field.enableSorting !== false;
	const header = field.header;

	operators = sanitizeOperators( field );
	// Filter can be added:
	// 1. If the field is not already part of a view's filters.
	// 2. If the field meets the type and operator requirements.
	// 3. If it's not primary. If it is, it should be already visible.
	canAddFilter =
		! view.filters?.some( ( _filter ) => fieldId === _filter.field ) &&
		!! field.elements?.length &&
		!! operators.length &&
		! field.filterBy?.isPrimary;

	return (
		<Menu>
			<Menu.TriggerButton
				render={
					<Button
						size="compact"
						className="dataviews-view-table-header-button"
						ref={ ref }
						variant="tertiary"
					/>
				}
			>
				{ header }
				{ view.sort && isSorted && (
					<span aria-hidden="true">
						{ sortArrows[ view.sort.direction ] }
					</span>
				) }
			</Menu.TriggerButton>
			<Menu.Popover style={ { minWidth: '240px' } }>
				<WithMenuSeparators>
					{ isSortable && (
						<Menu.Group>
							{ SORTING_DIRECTIONS.map(
								( direction: SortDirection ) => {
									const isChecked =
										view.sort &&
										isSorted &&
										view.sort.direction === direction;

									const value = `${ fieldId }-${ direction }`;

									return (
										<Menu.RadioItem
											key={ value }
											// All sorting radio items share the same name, so that
											// selecting a sorting option automatically deselects the
											// previously selected one, even if it is displayed in
											// another submenu. The field and direction are passed via
											// the `value` prop.
											name="view-table-sorting"
											value={ value }
											checked={ isChecked }
											onChange={ () => {
												onChangeView( {
													...view,
													sort: {
														field: fieldId,
														direction,
													},
													showLevels: false,
												} );
											} }
										>
											<Menu.ItemLabel>
												{ sortLabels[ direction ] }
											</Menu.ItemLabel>
										</Menu.RadioItem>
									);
								}
							) }
						</Menu.Group>
					) }
					{ canAddFilter && (
						<Menu.Group>
							<Menu.Item
								prefix={ <Icon icon={ funnel } /> }
								onClick={ () => {
									setOpenedFilter( fieldId );
									onChangeView( {
										...view,
										page: 1,
										filters: [
											...( view.filters || [] ),
											{
												field: fieldId,
												value: undefined,
												operator: operators[ 0 ],
											},
										],
									} );
								} }
							>
								<Menu.ItemLabel>
									{ __( 'Add filter' ) }
								</Menu.ItemLabel>
							</Menu.Item>
						</Menu.Group>
					) }
					{ ( canMove || isHidable ) && field && (
						<Menu.Group>
							{ canMove && (
								<Menu.Item
									prefix={ <Icon icon={ arrowLeft } /> }
									disabled={ index < 1 }
									onClick={ () => {
										onChangeView( {
											...view,
											fields: [
												...( visibleFieldIds.slice(
													0,
													index - 1
												) ?? [] ),
												fieldId,
												visibleFieldIds[ index - 1 ],
												...visibleFieldIds.slice(
													index + 1
												),
											],
										} );
									} }
								>
									<Menu.ItemLabel>
										{ __( 'Move left' ) }
									</Menu.ItemLabel>
								</Menu.Item>
							) }
							{ canMove && (
								<Menu.Item
									prefix={ <Icon icon={ arrowRight } /> }
									disabled={
										index >= visibleFieldIds.length - 1
									}
									onClick={ () => {
										onChangeView( {
											...view,
											fields: [
												...( visibleFieldIds.slice(
													0,
													index
												) ?? [] ),
												visibleFieldIds[ index + 1 ],
												fieldId,
												...visibleFieldIds.slice(
													index + 2
												),
											],
										} );
									} }
								>
									<Menu.ItemLabel>
										{ __( 'Move right' ) }
									</Menu.ItemLabel>
								</Menu.Item>
							) }
							{ isHidable && field && (
								<Menu.Item
									prefix={ <Icon icon={ unseen } /> }
									onClick={ () => {
										onHide( field );
										onChangeView( {
											...view,
											fields: visibleFieldIds.filter(
												( id ) => id !== fieldId
											),
										} );
									} }
								>
									<Menu.ItemLabel>
										{ __( 'Hide column' ) }
									</Menu.ItemLabel>
								</Menu.Item>
							) }
						</Menu.Group>
					) }
				</WithMenuSeparators>
			</Menu.Popover>
		</Menu>
	);
} );

// @ts-expect-error Lift the `Item` type argument through the forwardRef.
const ColumnHeaderMenu: < Item >(
	props: PropsWithoutRef< HeaderMenuProps< Item > > &
		RefAttributes< HTMLButtonElement >
) => ReturnType< typeof _HeaderMenu > = _HeaderMenu;

export default ColumnHeaderMenu;
