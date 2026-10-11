import { __ } from '@wordpress/i18n';
import React, { useId, useRef, useState } from 'react';
import { cn } from '../../utils/classNames';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { Tooltip } from '../ui/tooltip';
import styles from './Checklist.module.css';
import type { ChecklistItem, ChecklistItemStatus } from '../../types';

export interface ChecklistProps {
	title: string;
	items: ChecklistItem[];
	/** Controlled collapsed state. Leave unset for the component to manage it. */
	collapsed?: boolean;
	defaultCollapsed?: boolean;
	onCollapsedChange?: ( collapsed: boolean ) => void;
	/** Collapse the list once an item is selected. Defaults to true. */
	collapseOnSelect?: boolean;
	/** Return false when the prompt was not actually sent; the list then stays open. */
	onSubmit?: ( selectedItem: ChecklistItem, items: ChecklistItem[] ) => boolean | void;
	/** While true (e.g. a reply is streaming) open tasks look and act inert. */
	busy?: boolean;
	className?: string;
}

const getStatus = ( item: ChecklistItem ): ChecklistItemStatus => item.status ?? 'todo';

export const isSettled = ( item: ChecklistItem ): boolean =>
	[ 'done', 'skipped' ].includes( getStatus( item ) );

// Only an open task can be started: in-progress ones were already sent, and
// settled ones have nothing left to do. A task with neither a prompt nor an
// action has nothing to trigger. All of those render as plain rows.
const isActionable = ( item: ChecklistItem ): boolean =>
	! item.disabled && getStatus( item ) === 'todo' && Boolean( item.prompt || item.action );

// Eight arc segments: the dashed ring of an open task.
const RING_DASHED =
	'M6.6 15.528L5.4 16.323C6 17.2174 6.7 17.913 7.6 18.5093L8.4 17.3168C7.7 16.8199 7.1 16.2236 6.6 15.528ZM5.5 11.9503C5.5 11.5528 5.5 11.0559 5.6 10.6584L4.1 10.3602C4.1 10.8571 4 11.4534 4 11.9503C4 12.4472 4.1 13.0435 4.2 13.5404L5.7 13.2422C5.5 12.8447 5.5 12.3478 5.5 11.9503ZM17.4 8.37267L18.6 7.57764C18 6.68323 17.3 5.98758 16.4 5.3913L15.6 6.58385C16.3 7.08075 16.9 7.67702 17.4 8.37267ZM5.3 7.57764L6.5 8.37267C7 7.67702 7.6 7.08075 8.3 6.58385L7.6 5.29193C6.7 5.8882 5.9 6.68323 5.3 7.57764ZM19.8 10.3602L18.3 10.6584C18.4 11.0559 18.4 11.4534 18.4 11.9503C18.4 12.4472 18.4 12.8447 18.3 13.2422L19.8 13.5404C19.9 13.0435 20 12.5466 20 11.9503C20 11.354 19.9 10.8571 19.8 10.3602ZM12 18.4099C11.6 18.4099 11.1 18.4099 10.7 18.3106L10.4 19.8012C10.9 19.9006 11.4 20 12 20C12.6 20 13.1 19.9006 13.6 19.8012L13.3 18.3106C12.9 18.4099 12.4 18.4099 12 18.4099ZM15.6 17.3168L16.4 18.5093C17.3 17.913 18 17.2174 18.6 16.323L17.4 15.528C16.9 16.2236 16.3 16.8199 15.6 17.3168ZM10.4 4.19876L10.7 5.68944C11.1 5.59006 11.5 5.59006 12 5.59006C12.5 5.59006 12.9 5.59006 13.3 5.68944L13.6 4.19876C13.1 4.09938 12.5 4 12 4C11.5 4 10.9 4.09938 10.4 4.19876Z';

// Solid ring with the lower half filled: a task in progress.
const RING_HALF =
	'M12 18.5C10.2761 18.5 8.62279 17.8152 7.40381 16.5962C6.18482 15.3772 5.5 13.7239 5.5 12C5.5 10.2761 6.18482 8.62279 7.40381 7.40381C8.62279 6.18482 10.2761 5.5 12 5.5C13.7239 5.5 15.3772 6.18482 16.5962 7.40381C17.8152 8.62279 18.5 10.2761 18.5 12C18.5 13.7239 17.8152 15.3772 16.5962 16.5962C15.3772 17.8152 13.7239 18.5 12 18.5ZM4 12C4 9.87827 4.84285 7.84344 6.34315 6.34315C7.84344 4.84285 9.87827 4 12 4C14.1217 4 16.1566 4.84285 17.6569 6.34315C19.1571 7.84344 20 9.87827 20 12C20 14.1217 19.1571 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20C9.87827 20 7.84344 19.1571 6.34315 17.6569C4.84285 16.1566 4 14.1217 4 12ZM12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12H8C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16Z';

// Solid ring: a skipped task.
const RING =
	'M12 18.5C10.2761 18.5 8.62279 17.8152 7.40381 16.5962C6.18482 15.3772 5.5 13.7239 5.5 12C5.5 10.2761 6.18482 8.62279 7.40381 7.40381C8.62279 6.18482 10.2761 5.5 12 5.5C13.7239 5.5 15.3772 6.18482 16.5962 7.40381C17.8152 8.62279 18.5 10.2761 18.5 12C18.5 13.7239 17.8152 15.3772 16.5962 16.5962C15.3772 17.8152 13.7239 18.5 12 18.5ZM4 12C4 9.87827 4.84285 7.84344 6.34315 6.34315C7.84344 4.84285 9.87827 4 12 4C14.1217 4 16.1566 4.84285 17.6569 6.34315C19.1571 7.84344 20 9.87827 20 12C20 14.1217 19.1571 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20C9.87827 20 7.84344 19.1571 6.34315 17.6569C4.84285 16.1566 4 14.1217 4 12Z';

function StatusIcon( { status }: { status: ChecklistItemStatus } ) {
	return (
		<svg
			className={ cn( styles.icon, { [ styles[ 'icon-done' ] ]: status === 'done' } ) }
			width="24"
			height="24"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			{ status === 'todo' && <path d={ RING_DASHED } /> }
			{ status === 'in-progress' && <path fillRule="evenodd" clipRule="evenodd" d={ RING_HALF } /> }
			{ status === 'skipped' && <path fillRule="evenodd" clipRule="evenodd" d={ RING } /> }
			{ status === 'done' && (
				<>
					<circle cx="12" cy="12" r="8" />
					<path
						className={ styles[ 'icon-check' ] }
						d="M8.5 12.3L10.9 14.5L15.5 9.5"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</>
			) }
		</svg>
	);
}

type RowKind = 'open' | 'disabled' | 'inert';

const getRowKind = ( item: ChecklistItem ): RowKind => {
	if ( isActionable( item ) ) {
		return 'open';
	}
	// Status wins over `disabled`: only an open task can be a disabled one.
	return item.disabled && getStatus( item ) === 'todo' ? 'disabled' : 'inert';
};

interface ChecklistRowProps {
	item: ChecklistItem;
	/** Per-instance prefix, so two lists sharing task ids don't share DOM ids. */
	idPrefix: string;
	statusLabel: string;
	busy: boolean;
	onSelect: ( item: ChecklistItem ) => void;
}

function ChecklistRow( { item, idPrefix, statusLabel, busy, onSelect }: ChecklistRowProps ) {
	const status = getStatus( item );
	const className = cn( styles.item, {
		[ styles[ 'item-in-progress' ] ]: status === 'in-progress',
		[ styles.settled ]: isSettled( item ),
	} );
	const content = (
		<>
			<StatusIcon status={ status } />
			<span className={ styles.label }>{ item.label }</span>
			<span className={ styles.status }>{ statusLabel }</span>
		</>
	);

	switch ( getRowKind( item ) ) {
		case 'open':
			// Kept focusable while busy so keyboard position survives a stream.
			return (
				<button
					type="button"
					className={ cn( className, { [ styles.actionable ]: ! busy } ) }
					aria-disabled={ busy || undefined }
					onClick={ ( e ) => {
						e.stopPropagation();
						if ( ! busy ) {
							onSelect( item );
						}
					} }
				>
					{ content }
				</button>
			);
		case 'disabled': {
			// Stays focusable so the reason is reachable from the keyboard.
			const reasonId = item.disabledReason ? `${ idPrefix }-reason-${ item.id }` : undefined;
			const button = (
				<button
					type="button"
					className={ className }
					aria-disabled="true"
					aria-describedby={ reasonId }
				>
					{ content }
				</button>
			);
			return reasonId ? (
				<Tooltip label={ item.disabledReason as string } descriptionId={ reasonId }>
					{ button }
				</Tooltip>
			) : (
				button
			);
		}
		default:
			return <div className={ className }>{ content }</div>;
	}
}

/**
 * A task list that lives in the chat: a header with progress and a
 * collapse toggle, and one row per task. Clicking an open task submits it
 * the way a suggestion would, then collapses the list down to whatever is
 * in progress. In-progress and settled (done / skipped) rows are inert.
 * @param props                   Component props.
 * @param props.title
 * @param props.items
 * @param props.collapsed
 * @param props.defaultCollapsed
 * @param props.onCollapsedChange
 * @param props.collapseOnSelect
 * @param props.onSubmit
 * @param props.busy
 * @param props.className
 */
export function Checklist( {
	title,
	items,
	collapsed,
	defaultCollapsed = false,
	onCollapsedChange,
	collapseOnSelect = true,
	onSubmit,
	busy = false,
	className,
}: ChecklistProps ) {
	const [ internalCollapsed, setInternalCollapsed ] = useState( defaultCollapsed );
	const isControlled = collapsed !== undefined;
	const isCollapsed = isControlled ? collapsed : internalCollapsed;
	// Collapsing keeps the in-progress rows; when every row is in progress
	// that would hide nothing, so it folds them all instead.
	const foldEverything = items.every( ( item ) => getStatus( item ) === 'in-progress' );
	const listId = useId();
	const headerRef = useRef< HTMLButtonElement >( null );

	const setCollapsed = ( next: boolean ) => {
		if ( ! isControlled ) {
			setInternalCollapsed( next );
		}
		onCollapsedChange?.( next );
	};

	const settledCount = items.filter( isSettled ).length;

	const statusLabels: Record< ChecklistItemStatus, string > = {
		todo: __( 'To do', 'a8c-agenttic' ),
		'in-progress': __( 'In progress', 'a8c-agenttic' ),
		done: __( 'Done', 'a8c-agenttic' ),
		skipped: __( 'Skipped', 'a8c-agenttic' ),
	};

	// One click at a time: `action` may await a network call, during which the
	// row still looks clickable.
	const busyRef = useRef( false );

	const handleItemClick = async ( item: ChecklistItem ) => {
		if ( busyRef.current || ! isActionable( item ) ) {
			return;
		}
		busyRef.current = true;
		try {
			let started = true;
			if ( item.action ) {
				started = await item.action();
			}
			if ( started && item.prompt ) {
				started = onSubmit ? onSubmit( item, items ) !== false : false;
			}
			// Collapsing after the last open task was picked would fold every
			// row (it is about to be in progress too), so the list stays open.
			const leavesSomethingToFold = items.some(
				( other ) => other !== item && getStatus( other ) !== 'in-progress'
			);
			if ( started && collapseOnSelect && ! isCollapsed && leavesSomethingToFold ) {
				setCollapsed( true );
				// The clicked row folds away under aria-hidden; keep focus somewhere visible.
				headerRef.current?.focus();
			}
		} finally {
			busyRef.current = false;
		}
	};

	return (
		<div
			data-slot="checklist"
			className={ cn( styles.checklist, { [ styles.collapsed ]: isCollapsed }, className ) }
		>
			<button
				ref={ headerRef }
				type="button"
				className={ styles.header }
				aria-expanded={ ! isCollapsed }
				aria-controls={ listId }
				onClick={ () => setCollapsed( ! isCollapsed ) }
			>
				<span className={ styles.title }>{ title }</span>
				<span className={ styles.meta }>
					<span className={ styles.badge }>
						{ settledCount }/{ items.length }
					</span>
					{ isCollapsed ? (
						<ChevronDownIcon className={ styles.chevron } size={ 20 } />
					) : (
						<ChevronUpIcon className={ styles.chevron } size={ 20 } />
					) }
				</span>
			</button>

			{ /* Every row stays mounted so a collapse can animate; folded rows drop
			   to zero height and out of the accessibility tree. */ }
			<ul id={ listId } className={ styles.list }>
				{ items.map( ( item ) => {
					const hidden = isCollapsed && ( foldEverything || getStatus( item ) !== 'in-progress' );
					return (
						<li
							key={ item.id }
							className={ cn( { [ styles.hidden ]: hidden } ) }
							aria-hidden={ hidden || undefined }
						>
							<div className={ styles.roll }>
								<div className={ styles.pad }>
									<ChecklistRow
										item={ item }
										idPrefix={ listId }
										busy={ busy }
										statusLabel={ statusLabels[ getStatus( item ) ] }
										onSelect={ handleItemClick }
									/>
								</div>
							</div>
						</li>
					);
				} ) }
			</ul>
		</div>
	);
}
