/**
 * External dependencies
 */
import type { ReactElement } from 'react';

/**
 * WordPress dependencies
 */
import {
	Button,
	CheckboxControl,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __, sprintf, _n } from '@wordpress/i18n';
import { useMemo, useState, useRef, useContext } from '@wordpress/element';
import { useRegistry } from '@wordpress/data';
import { closeSmall } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import DataViewsContext from '../dataviews-context';
import { ActionModal } from '../dataviews-item-actions';
import type { Action, ActionModal as ActionModalType } from '../../types';
import type { SetSelection } from '../../private-types';
import type { ActionTriggerProps } from '../dataviews-item-actions';

interface ActionWithModalProps< Item > {
	action: ActionModalType< Item >;
	items: Item[];
	ActionTriggerComponent: (
		props: ActionTriggerProps< Item >
	) => ReactElement;
}

function ActionWithModal< Item >( {
	action,
	items,
	ActionTriggerComponent,
}: ActionWithModalProps< Item > ) {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const actionTriggerProps = {
		action,
		onClick: () => {
			setIsModalOpen( true );
		},
		items,
	};
	return (
		<>
			<ActionTriggerComponent { ...actionTriggerProps } />
			{ isModalOpen && (
				<ActionModal
					action={ action }
					items={ items }
					closeModal={ () => setIsModalOpen( false ) }
				/>
			) }
		</>
	);
}

export function useHasAPossibleBulkAction< Item >(
	actions: Action< Item >[],
	item: Item
) {
	return useMemo( () => {
		return actions.some( ( action ) => {
			return (
				action.supportsBulk &&
				( ! action.isEligible || action.isEligible( item ) )
			);
		} );
	}, [ actions, item ] );
}

export function useSomeItemHasAPossibleBulkAction< Item >(
	actions: Action< Item >[],
	data: Item[]
) {
	return useMemo( () => {
		return data.some( ( item ) => {
			return actions.some( ( action ) => {
				return (
					action.supportsBulk &&
					( ! action.isEligible || action.isEligible( item ) )
				);
			} );
		} );
	}, [ actions, data ] );
}

interface BulkSelectionCheckboxProps< Item > {
	selection: string[];
	onChangeSelection: SetSelection;
	data: Item[];
	actions: Action< Item >[];
	getItemId: ( item: Item ) => string;
}

export function BulkSelectionCheckbox< Item >( {
	selection,
	onChangeSelection,
	data,
	actions,
	getItemId,
}: BulkSelectionCheckboxProps< Item > ) {
	const selectableItems = useMemo( () => {
		return data.filter( ( item ) => {
			return actions.some(
				( action ) =>
					action.supportsBulk &&
					( ! action.isEligible || action.isEligible( item ) )
			);
		} );
	}, [ data, actions ] );
	const selectedItems = data.filter(
		( item ) =>
			selection.includes( getItemId( item ) ) &&
			selectableItems.includes( item )
	);
	const areAllSelected = selectedItems.length === selectableItems.length;
	return (
		<CheckboxControl
			className="dataviews-view-table-selection-checkbox"
			__nextHasNoMarginBottom
			checked={ areAllSelected }
			indeterminate={ ! areAllSelected && !! selectedItems.length }
			onChange={ () => {
				if ( areAllSelected ) {
					onChangeSelection( [] );
				} else {
					onChangeSelection(
						selectableItems.map( ( item ) => getItemId( item ) )
					);
				}
			} }
			aria-label={
				areAllSelected ? __( 'Deselect all' ) : __( 'Select all' )
			}
		/>
	);
}

interface ActionButtonProps< Item > {
	action: Action< Item >;
	selectedItems: Item[];
	actionInProgress: string | null;
	setActionInProgress: ( actionId: string | null ) => void;
}

interface ToolbarContentProps< Item > {
	selection: string[];
	onChangeSelection: SetSelection;
	data: Item[];
	actions: Action< Item >[];
	getItemId: ( item: Item ) => string;
}

function ActionTrigger< Item >( {
	action,
	onClick,
	isBusy,
	items,
}: ActionTriggerProps< Item > ) {
	const label =
		typeof action.label === 'string' ? action.label : action.label( items );
	return (
		<Button
			disabled={ isBusy }
			accessibleWhenDisabled
			label={ label }
			icon={ action.icon }
			isDestructive={ action.isDestructive }
			size="compact"
			onClick={ onClick }
			isBusy={ isBusy }
			tooltipPosition="top"
		/>
	);
}

const EMPTY_ARRAY: [] = [];

function ActionButton< Item >( {
	action,
	selectedItems,
	actionInProgress,
	setActionInProgress,
}: ActionButtonProps< Item > ) {
	const registry = useRegistry();
	const selectedEligibleItems = useMemo( () => {
		return selectedItems.filter( ( item ) => {
			return ! action.isEligible || action.isEligible( item );
		} );
	}, [ action, selectedItems ] );
	if ( 'RenderModal' in action ) {
		return (
			<ActionWithModal
				key={ action.id }
				action={ action }
				items={ selectedEligibleItems }
				ActionTriggerComponent={ ActionTrigger }
			/>
		);
	}
	return (
		<ActionTrigger
			key={ action.id }
			action={ action }
			onClick={ async () => {
				setActionInProgress( action.id );
				await action.callback( selectedItems, {
					registry,
				} );
				setActionInProgress( null );
			} }
			items={ selectedEligibleItems }
			isBusy={ actionInProgress === action.id }
		/>
	);
}

function renderFooterContent< Item >(
	data: Item[],
	actions: Action< Item >[],
	getItemId: ( item: Item ) => string,
	selection: string[],
	actionsToShow: Action< Item >[],
	selectedItems: Item[],
	actionInProgress: string | null,
	setActionInProgress: ( actionId: string | null ) => void,
	onChangeSelection: SetSelection
) {
	const message =
		selectedItems.length > 0
			? sprintf(
					/* translators: %d: number of items. */
					_n(
						'%d Item selected',
						'%d Items selected',
						selectedItems.length
					),
					selectedItems.length
			  )
			: sprintf(
					/* translators: %d: number of items. */
					_n( '%d Item', '%d Items', data.length ),
					data.length
			  );
	return (
		<HStack
			expanded={ false }
			className="dataviews-bulk-actions-footer__container"
			spacing={ 3 }
		>
			<BulkSelectionCheckbox
				selection={ selection }
				onChangeSelection={ onChangeSelection }
				data={ data }
				actions={ actions }
				getItemId={ getItemId }
			/>
			<span className="dataviews-bulk-actions-footer__item-count">
				{ message }
			</span>
			<HStack
				className="dataviews-bulk-actions-footer__action-buttons"
				expanded={ false }
				spacing={ 1 }
			>
				{ actionsToShow.map( ( action ) => {
					return (
						<ActionButton
							key={ action.id }
							action={ action }
							selectedItems={ selectedItems }
							actionInProgress={ actionInProgress }
							setActionInProgress={ setActionInProgress }
						/>
					);
				} ) }
				{ selectedItems.length > 0 && (
					<Button
						icon={ closeSmall }
						showTooltip
						tooltipPosition="top"
						size="compact"
						label={ __( 'Cancel' ) }
						disabled={ !! actionInProgress }
						accessibleWhenDisabled={ false }
						onClick={ () => {
							onChangeSelection( EMPTY_ARRAY );
						} }
					/>
				) }
			</HStack>
		</HStack>
	);
}

function FooterContent< Item >( {
	selection,
	actions,
	onChangeSelection,
	data,
	getItemId,
}: ToolbarContentProps< Item > ) {
	const [ actionInProgress, setActionInProgress ] = useState< string | null >(
		null
	);
	const footerContentRef = useRef< JSX.Element | null >( null );

	const bulkActions = useMemo(
		() => actions.filter( ( action ) => action.supportsBulk ),
		[ actions ]
	);
	const selectableItems = useMemo( () => {
		return data.filter( ( item ) => {
			return bulkActions.some(
				( action ) => ! action.isEligible || action.isEligible( item )
			);
		} );
	}, [ data, bulkActions ] );

	const selectedItems = useMemo( () => {
		return data.filter(
			( item ) =>
				selection.includes( getItemId( item ) ) &&
				selectableItems.includes( item )
		);
	}, [ selection, data, getItemId, selectableItems ] );

	const actionsToShow = useMemo(
		() =>
			actions.filter( ( action ) => {
				return (
					action.supportsBulk &&
					action.icon &&
					selectedItems.some(
						( item ) =>
							! action.isEligible || action.isEligible( item )
					)
				);
			} ),
		[ actions, selectedItems ]
	);
	if ( ! actionInProgress ) {
		if ( footerContentRef.current ) {
			footerContentRef.current = null;
		}
		return renderFooterContent(
			data,
			actions,
			getItemId,
			selection,
			actionsToShow,
			selectedItems,
			actionInProgress,
			setActionInProgress,
			onChangeSelection
		);
	} else if ( ! footerContentRef.current ) {
		footerContentRef.current = renderFooterContent(
			data,
			actions,
			getItemId,
			selection,
			actionsToShow,
			selectedItems,
			actionInProgress,
			setActionInProgress,
			onChangeSelection
		);
	}
	return footerContentRef.current;
}

export function BulkActionsFooter() {
	const {
		data,
		selection,
		actions = EMPTY_ARRAY,
		onChangeSelection,
		getItemId,
	} = useContext( DataViewsContext );
	return (
		<FooterContent
			selection={ selection }
			onChangeSelection={ onChangeSelection }
			data={ data }
			actions={ actions }
			getItemId={ getItemId }
		/>
	);
}
