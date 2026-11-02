import { __, sprintf } from '@wordpress/i18n';
import { formatCreditsLeft, getCreditsLabel, type CreditsStatus } from './credits';

/** The slash command that answers with the site's credits instead of asking the model. */
const CREDITS_COMMAND = '/credits';

/** Starts the ids of the messages `/credits` adds to the thread, which only the browser knows. */
export const CREDITS_COMMAND_MESSAGE_ID_PREFIX = 'credits-command-';

export function isCreditsCommandMessageId( id: string ): boolean {
	return id.startsWith( CREDITS_COMMAND_MESSAGE_ID_PREFIX );
}

export function isCreditsCommand( message: string ): boolean {
	return message.trim() === CREDITS_COMMAND;
}

/** Top-ups left, or `undefined` when the popover would show no row or an empty one. */
export function getTopUpCreditsRemaining( status: CreditsStatus ): number | undefined {
	const topUps = status.pools.find( ( pool ) => pool.id === 'topups' );
	return topUps && topUps.remaining > 0 ? topUps.remaining : undefined;
}

/** The answer as one sentence for screen readers, which the card announces when it appears. */
export function getCreditsAnswerSummary( status: CreditsStatus, purchaseHint?: string ): string {
	const parts = [ getCreditsLabel( status ) ];
	const plan = status.pools.find( ( pool ) => pool.id === 'plan' );
	if ( plan?.dateLabel ) {
		parts.push( plan.dateLabel );
	}
	const topUps = getTopUpCreditsRemaining( status );
	if ( topUps !== undefined ) {
		parts.push(
			sprintf(
				/* translators: %s: top-up credits left, e.g. "67k credits left" */
				__( 'Top-ups: %s', __i18n_text_domain__ ),
				formatCreditsLeft( topUps )
			)
		);
	}
	if ( purchaseHint ) {
		parts.push( purchaseHint );
	}
	return parts.join( '. ' );
}
