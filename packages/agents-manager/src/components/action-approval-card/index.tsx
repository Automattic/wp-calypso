import { Button } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import {
	canAnswerApproval,
	formatApprovalArgument,
	getApprovalActionLabel,
	getApprovalStatusMessage,
	type ActionApproval,
	type ActionApprovalDecision,
} from '../../utils/action-approvals';
import './style.scss';

interface Props {
	approval: ActionApproval;
	/** While another turn runs: the answer couldn't be sent until it ends. */
	isDisabled: boolean;
	onDecide: ( decision: ActionApprovalDecision ) => void;
}

/**
 * Asks the user to allow or decline an ability call WordPress Agent is holding,
 * and once answered, says in its place how the call ended.
 */
export function ActionApprovalCard( { approval, isDisabled, onDecide }: Props ) {
	const statusMessage = getApprovalStatusMessage( approval );
	if ( statusMessage ) {
		return (
			<p
				className={ clsx(
					'agents-manager-action-approval-status',
					`agents-manager-action-approval-status--${ approval.status }`
				) }
				role="status"
			>
				{ statusMessage }
			</p>
		);
	}

	const areButtonsDisabled = isDisabled || ! canAnswerApproval( approval );
	const argumentEntries = Object.entries( approval.arguments );

	return (
		<div className="agents-manager-action-approval-card">
			<p className="agents-manager-action-approval-card__eyebrow">
				{ __( 'Approval needed', __i18n_text_domain__ ) }
			</p>
			<p className="agents-manager-action-approval-card__title">
				{ getApprovalActionLabel( approval ) }
			</p>
			{ argumentEntries.length > 0 && (
				<dl className="agents-manager-action-approval-card__arguments">
					{ argumentEntries.map( ( [ name, value ] ) => (
						<Fragment key={ name }>
							<dt>{ name }</dt>
							<dd>{ formatApprovalArgument( value ) }</dd>
						</Fragment>
					) ) }
				</dl>
			) }
			<p
				className={ clsx(
					'agents-manager-action-approval-card__status',
					`agents-manager-action-approval-card__status--${ approval.status }`
				) }
				role="status"
			>
				{ approval.status === 'sending'
					? __( 'Sending…', __i18n_text_domain__ )
					: approval.message }
			</p>
			<div className="agents-manager-action-approval-card__actions">
				<Button
					variant="primary"
					size="compact"
					disabled={ areButtonsDisabled }
					accessibleWhenDisabled
					onClick={ () => onDecide( 'allow' ) }
				>
					{ __( 'Allow', __i18n_text_domain__ ) }
				</Button>
				<Button
					variant="secondary"
					size="compact"
					disabled={ areButtonsDisabled }
					accessibleWhenDisabled
					onClick={ () => onDecide( 'decline' ) }
				>
					{ __( 'Decline', __i18n_text_domain__ ) }
				</Button>
			</div>
		</div>
	);
}
