import { __ } from '@wordpress/i18n';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../../utils/classNames';
import { Button } from '../ui/button';
import styles from './ApprovalCard.module.css';

export type ApprovalDecision = 'allow_once' | 'allow_for_chat' | 'decline';
export type ApprovalCardState =
	'pending' | 'sending' | 'done' | 'declined' | 'failed' | 'cancelled' | 'outcome_unknown';

export interface ApprovalCardProps {
	proposalId: string;
	description: string;
	notice: string;
	site?: string;
	target?: string;
	allowForChat: boolean;
	state: ApprovalCardState;
	onDecision: ( decision: ApprovalDecision ) => void;
	className?: string;
}

export function ApprovalCard( props: ApprovalCardProps ) {
	return <ApprovalCardContent key={ props.proposalId } { ...props } />;
}

function ApprovalCardContent( {
	description,
	notice,
	site,
	target,
	allowForChat,
	state,
	onDecision,
	className,
}: ApprovalCardProps ) {
	const titleId = useId();
	const noticeId = useId();
	const cardRef = useRef< HTMLElement >( null );
	const decisionSent = useRef( false );
	const [ submitted, setSubmitted ] = useState( false );
	const previousState = useRef( state );

	useEffect( () => {
		if ( previousState.current === 'sending' && state === 'pending' ) {
			decisionSent.current = false;
			setSubmitted( false );
		}
		previousState.current = state;
	}, [ state ] );

	const isSending = state === 'sending' || ( state === 'pending' && submitted );
	const showControls = state === 'pending' || state === 'sending';
	const status = {
		pending: __( 'Approval required', 'a8c-agenttic' ),
		sending: __( 'Processing…', 'a8c-agenttic' ),
		done: __( 'Action completed', 'a8c-agenttic' ),
		declined: __( 'Declined', 'a8c-agenttic' ),
		failed: __( 'Action failed', 'a8c-agenttic' ),
		cancelled: __( 'Cancelled', 'a8c-agenttic' ),
		outcome_unknown: __( 'The action’s outcome is unknown.', 'a8c-agenttic' ),
	}[ isSending ? 'sending' : state ];

	function decide( decision: ApprovalDecision ) {
		if ( state !== 'pending' || decisionSent.current ) {
			return;
		}
		decisionSent.current = true;
		setSubmitted( true );
		cardRef.current?.focus();
		onDecision( decision );
	}

	return (
		<section
			ref={ cardRef }
			tabIndex={ -1 }
			aria-labelledby={ titleId }
			aria-describedby={ noticeId }
			className={ cn( styles.card, className ) }
			data-agenttic-approval-card
			data-slot="card"
		>
			<p id={ titleId } className={ styles.title } data-slot="description">
				{ description }
			</p>
			{ ( site || target ) && (
				<dl className={ styles.details }>
					{ site && (
						<>
							<dt>{ __( 'Site', 'a8c-agenttic' ) }</dt>
							<dd data-slot="site">{ site }</dd>
						</>
					) }
					{ target && (
						<>
							<dt>{ __( 'Target', 'a8c-agenttic' ) }</dt>
							<dd data-slot="target">{ target }</dd>
						</>
					) }
				</dl>
			) }
			<p id={ noticeId } className={ styles.notice } data-slot="notice">
				{ notice }
			</p>
			<p role="status" aria-atomic="true" className={ styles.status } data-slot="status">
				{ status }
			</p>
			{ showControls && (
				<div className={ styles.actions } data-slot="actions">
					<Button type="button" disabled={ isSending } onClick={ () => decide( 'allow_once' ) }>
						{ __( 'Allow', 'a8c-agenttic' ) }
					</Button>
					{ allowForChat && (
						<Button
							type="button"
							variant="outline"
							disabled={ isSending }
							onClick={ () => decide( 'allow_for_chat' ) }
						>
							{ __( 'Allow for this chat', 'a8c-agenttic' ) }
						</Button>
					) }
					<Button
						type="button"
						variant="outline"
						disabled={ isSending }
						onClick={ () => decide( 'decline' ) }
					>
						{ __( 'Decline', 'a8c-agenttic' ) }
					</Button>
				</div>
			) }
		</section>
	);
}
