/**
 * PROTOTYPE — proof of concept only.
 *
 * The partner manager area at the top of “Your growth plan” for established
 * agencies at Pro tier and above: who their partner manager is, the next
 * check-in, a recap of the last call, and the next steps agreed on it. Signup
 * plans for new agencies grow into this as partner managers take over.
 * Call data is dummy data (see `partner-calls.ts`).
 */
import {
	Button,
	CheckboxControl,
	TextareaControl,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';
import { download } from '@wordpress/icons';
import { useState } from 'react';
import { Text } from '../../../components/text';
import NewTabLabel from '../new-tab-label';
import { getInitials } from './partner-managers';
import type { CallRecap, CallTodo, PartnerCalls } from './partner-calls';
import type { PartnerManager } from './partner-managers';
import type { CSSProperties } from 'react';

const AVATAR_SIZE = 48;
const DAY = 24 * 60 * 60 * 1000;

const formatDate = ( date: Date ) =>
	date.toLocaleDateString( undefined, { month: 'short', day: 'numeric', year: 'numeric' } );

const formatDateTime = ( date: Date ) =>
	date.toLocaleString( undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	} );

const getFirstName = ( name: string ) => name.split( ' ' )[ 0 ];

// PROTOTYPE: the full call notes as a text file. Real notes will come from the
// partner manager's call log; this builds them from the sample recap.
function downloadCallNotes( manager: PartnerManager, call: CallRecap, completedTodoIds: string[] ) {
	const firstName = getFirstName( manager.name );
	const lines = [
		sprintf(
			/* translators: %s is the date of the call */
			__( 'Call notes · %s' ),
			formatDate( call.date )
		),
		sprintf(
			/* translators: %s is the partner manager's name */
			__( 'With %s, your partner manager' ),
			manager.name
		),
		'',
		__( 'Summary' ),
		call.summary,
		'',
		__( 'Next steps' ),
		...call.todos.map( ( todo ) => {
			const isDone =
				completedTodoIds.includes( todo.id ) || ( todo.isDoneByPartnerManager ?? false );
			const owner = todo.owner === 'agency' ? __( 'You' ) : firstName;
			return `${ isDone ? '[x]' : '[ ]' } ${ todo.title } (${ owner }, ${ formatDate(
				todo.dueDate
			) })`;
		} ),
	];
	const blob = new Blob( [ lines.join( '\n' ) ], { type: 'text/plain' } );
	const url = URL.createObjectURL( blob );
	const link = document.createElement( 'a' );
	link.href = url;
	link.download = `call-notes-${ call.date.toISOString().slice( 0, 10 ) }.txt`;
	link.click();
	URL.revokeObjectURL( url );
}

export function ManagerAvatar( { manager }: { manager: PartnerManager } ) {
	const style: CSSProperties = {
		flexShrink: 0,
		width: `${ AVATAR_SIZE }px`,
		height: `${ AVATAR_SIZE }px`,
		borderRadius: '50%',
	};
	if ( manager.photoUrl ) {
		return <img src={ manager.photoUrl } alt="" style={ { ...style, objectFit: 'cover' } } />;
	}
	return (
		<div
			aria-hidden="true"
			style={ {
				...style,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'var(--wp-admin-theme-color)',
				color: 'var(--color-text-inverted)',
				fontSize: '16px',
				fontWeight: 600,
			} }
		>
			{ getInitials( manager.name ) }
		</div>
	);
}

function Label( { children }: { children: string } ) {
	return (
		<Text
			size={ 11 }
			weight={ 600 }
			lineHeight="16px"
			style={ { textTransform: 'uppercase', letterSpacing: '0.04em' } }
			variant="muted"
		>
			{ children }
		</Text>
	);
}

function NextSteps( {
	todos,
	manager,
	completedTodoIds,
	onToggleTodo,
}: {
	todos: CallTodo[];
	manager: PartnerManager;
	completedTodoIds: string[];
	onToggleTodo: ( id: string ) => void;
} ) {
	const agencyTodos = todos.filter( ( todo ) => todo.owner === 'agency' );
	const doneCount = agencyTodos.filter( ( todo ) => completedTodoIds.includes( todo.id ) ).length;

	return (
		<VStack spacing={ 3 }>
			<HStack justify="space-between" alignment="center">
				<Label>{ __( 'Next steps' ) }</Label>
				<Text variant="muted" size={ 12 } lineHeight="16px">
					{ sprintf(
						/* translators: 1: completed to-dos, 2: total to-dos owned by the agency */
						__( '%1$d of %2$d done' ),
						doneCount,
						agencyTodos.length
					) }
				</Text>
			</HStack>
			<VStack spacing={ 3 }>
				{ todos.map( ( todo ) => {
					const isAgency = todo.owner === 'agency';
					const owner = isAgency ? __( 'You' ) : getFirstName( manager.name );
					const isDone = isAgency
						? completedTodoIds.includes( todo.id )
						: !! todo.isDoneByPartnerManager;
					const isLate = ! isDone && todo.dueDate.getTime() < Date.now();
					let detail: string = sprintf(
						/* translators: 1: who owns the to-do, 2: due date */
						__( '%1$s · Due %2$s' ),
						owner,
						formatDate( todo.dueDate )
					);
					if ( isDone && ! isAgency ) {
						/* translators: %s is who completed the to-do */
						detail = sprintf( __( '%s · Done' ), owner );
					} else if ( isLate ) {
						detail = sprintf(
							/* translators: 1: who owns the to-do, 2: the missed due date */
							__( '%1$s · Overdue, was due %2$s' ),
							owner,
							formatDate( todo.dueDate )
						);
					}
					return (
						<CheckboxControl
							key={ todo.id }
							__nextHasNoMarginBottom
							label={ todo.title }
							help={
								isLate ? <span style={ { color: 'var(--color-error)' } }>{ detail }</span> : detail
							}
							checked={ isDone }
							// Partner-manager items are tracked by them, so the agency only sees them.
							disabled={ ! isAgency }
							onChange={ () => onToggleTodo( todo.id ) }
						/>
					);
				} ) }
			</VStack>
		</VStack>
	);
}

function DiscussionNotes( {
	notes,
	managerFirstName,
	onSave,
}: {
	notes: string;
	managerFirstName: string;
	onSave: ( notes: string ) => void;
} ) {
	const [ isEditing, setIsEditing ] = useState( false );
	const [ draft, setDraft ] = useState( notes );

	if ( isEditing ) {
		return (
			<VStack spacing={ 2 }>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Discussion notes' ) }
					help={ sprintf(
						/* translators: %s is the partner manager's first name */
						__( '%s will see these before the call.' ),
						managerFirstName
					) }
					value={ draft }
					onChange={ setDraft }
					rows={ 4 }
					maxLength={ 1000 }
					placeholder={ __( 'Topics, questions, or wins you want to cover…' ) }
				/>
				<HStack spacing={ 2 } justify="flex-start">
					<Button
						variant="primary"
						size="compact"
						onClick={ () => {
							onSave( draft.trim() );
							setIsEditing( false );
						} }
					>
						{ __( 'Save notes' ) }
					</Button>
					<Button
						variant="tertiary"
						size="compact"
						onClick={ () => {
							setDraft( notes );
							setIsEditing( false );
						} }
					>
						{ __( 'Cancel' ) }
					</Button>
				</HStack>
			</VStack>
		);
	}

	if ( notes ) {
		return (
			<VStack spacing={ 1 }>
				<HStack justify="space-between" alignment="center">
					<Label>{ __( 'Your discussion notes' ) }</Label>
					<Button variant="link" onClick={ () => setIsEditing( true ) }>
						{ __( 'Edit' ) }
					</Button>
				</HStack>
				<Text lineHeight="20px" style={ { whiteSpace: 'pre-wrap' } }>
					{ notes }
				</Text>
			</VStack>
		);
	}

	return (
		<HStack justify="flex-start">
			<Button variant="link" onClick={ () => setIsEditing( true ) }>
				{ __( 'Add discussion notes' ) }
			</Button>
		</HStack>
	);
}

// Compact header for a booked check-in: who, when, and the two actions on one
// tinted row, with discussion notes underneath.
/** The booked call row: also used for a new agency's advisor call (`kind="advisor"`). */
export function NextCheckIn( {
	manager,
	date,
	joinUrl,
	discussionNotes,
	onSaveNotes,
	onScheduleCall,
	isSchedulingCall,
	kind = 'check-in',
	topic,
}: {
	manager: PartnerManager;
	kind?: 'check-in' | 'advisor';
	/** What the call will cover, shown under the date. */
	topic?: string;
	date: Date;
	joinUrl?: string;
	discussionNotes: string;
	onSaveNotes: ( notes: string ) => void;
	onScheduleCall?: () => void;
	isSchedulingCall?: boolean;
} ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const days = Math.round(
		( new Date( date ).setHours( 0, 0, 0, 0 ) - new Date().setHours( 0, 0, 0, 0 ) ) / DAY
	);
	let when: string;
	if ( days <= 0 ) {
		when = __( 'Today' );
	} else if ( days === 1 ) {
		when = __( 'Tomorrow' );
	} else {
		/* translators: %d is the number of days until the call */
		when = sprintf( _n( 'In %d day', 'In %d days', days ), days );
	}

	return (
		<VStack
			spacing={ 3 }
			style={ {
				padding: '16px',
				borderRadius: '8px',
				background: 'rgba(56, 88, 233, 0.06)',
				border: '1px solid rgba(56, 88, 233, 0.18)',
			} }
		>
			<HStack
				spacing={ 4 }
				alignment={ isSmallViewport ? 'flex-start' : 'center' }
				justify="space-between"
				wrap={ isSmallViewport }
			>
				<HStack spacing={ 3 } alignment="center" justify="flex-start" style={ { flex: 1 } }>
					<ManagerAvatar manager={ manager } />
					<VStack spacing={ 0 }>
						<Text size={ 12 } variant="muted" lineHeight="16px">
							{ kind === 'advisor'
								? sprintf(
										/* translators: 1: advisor's name, 2: relative time, e.g. "In 4 days" */
										__( 'Advisor call with %1$s · %2$s' ),
										manager.name,
										when
									)
								: sprintf(
										/* translators: 1: partner manager's name, 2: relative time, e.g. "In 4 days" */
										__( 'Check-in with %1$s · %2$s' ),
										manager.name,
										when
									) }
						</Text>
						<Heading level={ 3 } size={ 15 } weight={ 600 } lineHeight="24px">
							{ formatDateTime( date ) }
						</Heading>
						{ topic && (
							<Text size={ 13 } variant="muted" lineHeight="20px">
								{ topic }
							</Text>
						) }
					</VStack>
				</HStack>
				<HStack spacing={ 2 } justify="flex-end" expanded={ false } style={ { flexShrink: 0 } }>
					<Button
						variant="tertiary"
						size="compact"
						onClick={ onScheduleCall }
						isBusy={ isSchedulingCall }
						disabled={ ! onScheduleCall || isSchedulingCall }
					>
						{ __( 'Reschedule' ) }
					</Button>
					{ joinUrl && (
						<Button
							variant="primary"
							size="compact"
							href={ joinUrl }
							target="_blank"
							rel="noreferrer"
						>
							<NewTabLabel>{ __( 'Join call' ) }</NewTabLabel>
						</Button>
					) }
				</HStack>
			</HStack>
			<div style={ { paddingInlineStart: isSmallViewport ? 0 : '60px' } }>
				<DiscussionNotes
					notes={ discussionNotes }
					managerFirstName={ getFirstName( manager.name ) }
					onSave={ onSaveNotes }
				/>
			</div>
		</VStack>
	);
}

interface PartnerManagerHubProps {
	manager: PartnerManager;
	calls: PartnerCalls;
	completedTodoIds: string[];
	onToggleTodo: ( id: string ) => void;
	discussionNotes: string;
	onSaveNotes: ( notes: string ) => void;
	onScheduleCall?: () => void;
	isSchedulingCall?: boolean;
}

export default function PartnerManagerHub( {
	manager,
	calls,
	completedTodoIds,
	onToggleTodo,
	discussionNotes,
	onSaveNotes,
	onScheduleCall,
	isSchedulingCall,
}: PartnerManagerHubProps ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const { nextCall, joinUrl, lastCall, isOverdue } = calls;
	const firstName = getFirstName( manager.name );
	// The recap stays one click away so next steps lead.
	const [ isRecapOpen, setIsRecapOpen ] = useState( false );

	const overdueMonths = lastCall
		? Math.floor( ( Date.now() - lastCall.date.getTime() ) / ( 30 * DAY ) )
		: 0;

	return (
		<VStack spacing={ 6 }>
			{ isOverdue && (
				<div
					role="status"
					style={ {
						padding: '12px 16px',
						borderRadius: '4px',
						background: '#fcf9e8',
						borderInlineStart: '4px solid #dba617',
					} }
				>
					<Text weight={ 500 } lineHeight="20px">
						{ sprintf(
							/* translators: 1: number of months, 2: partner manager's first name */
							_n(
								'It’s been %1$d month since your last check-in. Catch up with %2$s to keep your plan on track.',
								'It’s been %1$d months since your last check-in. Catch up with %2$s to keep your plan on track.',
								overdueMonths
							),
							overdueMonths,
							firstName
						) }
					</Text>
				</div>
			) }

			{ ! nextCall && (
				<HStack
					spacing={ 4 }
					alignment={ isSmallViewport ? 'flex-start' : 'center' }
					justify="space-between"
					wrap={ isSmallViewport }
				>
					<HStack spacing={ 3 } alignment="center" justify="flex-start" style={ { flex: 1 } }>
						<ManagerAvatar manager={ manager } />
						<VStack spacing={ 1 }>
							<Heading level={ 3 } size={ 15 } weight={ 500 }>
								{ manager.name }
							</Heading>
							<Text variant="muted" lineHeight="20px">
								{ __( 'Your partner manager · No check-in scheduled' ) }
							</Text>
						</VStack>
					</HStack>
					<Button
						variant="primary"
						onClick={ onScheduleCall }
						isBusy={ isSchedulingCall }
						disabled={ ! onScheduleCall || isSchedulingCall }
						style={ { flexShrink: 0 } }
					>
						{ sprintf(
							/* translators: %s is the partner manager's first name */
							__( 'Schedule a check-in with %s' ),
							firstName
						) }
					</Button>
				</HStack>
			) }

			{ nextCall && (
				<NextCheckIn
					manager={ manager }
					date={ nextCall }
					joinUrl={ joinUrl }
					discussionNotes={ discussionNotes }
					onSaveNotes={ onSaveNotes }
					onScheduleCall={ onScheduleCall }
					isSchedulingCall={ isSchedulingCall }
				/>
			) }

			{ lastCall && lastCall.todos.length > 0 && (
				<NextSteps
					todos={ lastCall.todos }
					manager={ manager }
					completedTodoIds={ completedTodoIds }
					onToggleTodo={ onToggleTodo }
				/>
			) }

			{ lastCall && (
				<VStack spacing={ 2 }>
					<HStack justify="flex-start">
						<Button
							variant="link"
							aria-expanded={ isRecapOpen }
							onClick={ () => setIsRecapOpen( ( value ) => ! value ) }
						>
							{ isRecapOpen
								? __( 'Hide last call recap' )
								: sprintf(
										/* translators: %s is the date of the last call */
										__( 'View last call recap (%s)' ),
										formatDate( lastCall.date )
									) }
						</Button>
					</HStack>
					{ isRecapOpen && (
						<VStack spacing={ 3 }>
							<Text lineHeight="20px">{ lastCall.summary }</Text>
							<HStack justify="flex-start">
								<Button
									variant="secondary"
									size="compact"
									icon={ download }
									onClick={ () => downloadCallNotes( manager, lastCall, completedTodoIds ) }
								>
									{ __( 'Download full call notes' ) }
								</Button>
							</HStack>
						</VStack>
					) }
				</VStack>
			) }
		</VStack>
	);
}
