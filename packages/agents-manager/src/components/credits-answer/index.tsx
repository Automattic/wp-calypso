import { Button, VisuallyHidden } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { type CreditsStatus, formatCreditsShort } from '../../utils/credits';
import { getCreditsAnswerSummary, getTopUpCreditsRemaining } from '../../utils/credits-command';
import type { CreditsAnswerAction } from '../../hooks/use-credits';
import './style.scss';

/** A card older than this is history, so it isn't announced again when the chat remounts. */
const ANNOUNCE_WINDOW_MS = 2000;

interface Props {
	status: CreditsStatus;
	/** When the monthly plan credits reset, already formatted for display. */
	resetDate: string;
	/** The purchases to offer, as links that open a new tab. */
	actions: CreditsAnswerAction[];
	/** Shown instead of a button to people who can't buy for the site themselves. */
	purchaseHint?: string;
	createdAt: number;
}

/**
 * Announces a `/credits` reply that has no card (still loading, failed, no AI credits) to screen
 * readers. The text itself is the message's own text part, so this draws nothing.
 */
export function CreditsMessage( { text, createdAt }: { text: string; createdAt: number } ) {
	const [ announcement, setAnnouncement ] = useState( '' );
	useEffect( () => {
		if ( Date.now() - createdAt < ANNOUNCE_WINDOW_MS ) {
			setAnnouncement( text );
		}
	}, [ createdAt, text ] );

	return <VisuallyHidden role="status">{ announcement }</VisuallyHidden>;
}

/**
 * The thread's answer to `/credits`: a table of where the site's credits stand, as of the ask, and
 * a card with the purchase the composer's credits popover offers, or who to ask.
 */
export function CreditsAnswer( { status, resetDate, actions, purchaseHint, createdAt }: Props ) {
	const plan = status.pools.find( ( pool ) => pool.id === 'plan' );
	const topUps = getTopUpCreditsRemaining( status );
	const canUpgrade = actions.some( ( action ) => action.kind === 'upgrade' );
	const hasNeedMore = actions.length > 0 || !! purchaseHint;

	// A live region announces what changes after it is in the page, not what it starts with.
	const [ announcement, setAnnouncement ] = useState( '' );
	useEffect( () => {
		if ( Date.now() - createdAt < ANNOUNCE_WINDOW_MS ) {
			setAnnouncement( getCreditsAnswerSummary( status, purchaseHint ) );
		}
	}, [ createdAt, status, purchaseHint ] );

	return (
		<div className="agents-manager-credits-answer">
			<VisuallyHidden role="status">{ announcement }</VisuallyHidden>
			<div className="agents-manager-credits-answer__card">
				<table className="agents-manager-credits-answer__table">
					<caption>{ __( 'Site credits', __i18n_text_domain__ ) }</caption>
					<thead>
						<tr>
							<th scope="col">{ __( 'Source', __i18n_text_domain__ ) }</th>
							<th scope="col">{ __( 'Left', __i18n_text_domain__ ) }</th>
							<th scope="col">{ __( 'Resets', __i18n_text_domain__ ) }</th>
						</tr>
					</thead>
					<tbody>
						{ plan?.remaining !== undefined && (
							<tr>
								<th scope="row">{ plan.label }</th>
								<td>{ formatCreditsShort( plan.remaining ) }</td>
								<td>
									{ sprintf(
										/* translators: %s: the reset date, formatted in UTC, e.g. "Oct 17" */
										__( '%s (UTC)', __i18n_text_domain__ ),
										resetDate
									) }
								</td>
							</tr>
						) }
						{ topUps !== undefined && (
							<tr>
								<th scope="row">{ __( 'Top-ups', __i18n_text_domain__ ) }</th>
								<td>{ formatCreditsShort( topUps ) }</td>
								<td>{ __( 'Don’t expire', __i18n_text_domain__ ) }</td>
							</tr>
						) }
						{ status.remaining !== undefined &&
							( topUps !== undefined ||
								( plan?.remaining !== undefined && status.remaining !== plan.remaining ) ) && (
								<tr>
									<th scope="row">{ __( 'Total', __i18n_text_domain__ ) }</th>
									<td>{ formatCreditsShort( status.remaining ) }</td>
									<td />
								</tr>
							) }
					</tbody>
				</table>
			</div>
			{ hasNeedMore && (
				<section className="agents-manager-credits-answer__card agents-manager-credits-answer__need-more">
					<h3 className="agents-manager-credits-answer__heading">
						{ __( 'Need more?', __i18n_text_domain__ ) }
					</h3>
					{ actions.length > 0 && (
						<p>
							{ canUpgrade
								? __(
										'Upgrading your plan raises your monthly credits. Top-ups don’t expire.',
										__i18n_text_domain__
									)
								: __( 'Add a credits pack for more. Top-ups don’t expire.', __i18n_text_domain__ ) }
						</p>
					) }
					{ purchaseHint && <p>{ purchaseHint }</p> }
					{ actions.length > 0 && (
						<div className="agents-manager-credits-answer__actions">
							{ actions.map( ( action ) => (
								<Button
									key={ action.kind }
									variant={
										actions.length === 1 || action.kind === 'upgrade' ? 'primary' : 'secondary'
									}
									href={ action.href }
									target={ action.target }
									rel={ action.rel }
									onClick={ action.onClick }
								>
									{ action.label }
								</Button>
							) ) }
						</div>
					) }
				</section>
			) }
		</div>
	);
}
