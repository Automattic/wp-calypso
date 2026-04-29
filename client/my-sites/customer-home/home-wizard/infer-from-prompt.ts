import type { FeatureKey, GoalKey } from './types';

/**
 * PLACEHOLDER until the odie AI integration lands.
 *
 * Maps a free-text prompt to a Goal + Features set using simple keyword
 * matching. The wizard saves the raw prompt; this function turns it into
 * shape `selectTasks()` already understands. Replace with a real AI call
 * (likely `useSendOdieMessage` from `@automattic/odie-client`) without
 * touching the rest of the dashboard.
 */
export function inferAnswersFromPrompt( prompt: string ): {
	goal: GoalKey;
	features: FeatureKey[];
} {
	const p = prompt.toLowerCase();

	let goal: GoalKey = 'build';
	if ( /\bnewsletter|substack|subscribe(rs)?\b/.test( p ) ) {
		goal = 'newsletter';
	} else if ( /\b(sell|store|shop|product|merch|ecommerce|e-commerce)\b/.test( p ) ) {
		goal = 'sell';
	} else if ( /\b(blog|write|writing|article|posts?|essay|journal)\b/.test( p ) ) {
		goal = 'write';
	} else if ( /\b(portfolio|gallery|showcase|case studies?|projects?)\b/.test( p ) ) {
		goal = 'portfolio';
	} else if ( /\b(promote|landing page|business|services?|agency|brand)\b/.test( p ) ) {
		goal = 'promote';
	}

	const features = new Set< FeatureKey >();
	if ( /\b(newsletter|email|subscribers?|inbox)\b/.test( p ) ) {
		features.add( 'newsletter' );
	}
	if ( /\b(comments?|discuss(ion)?|community|conversation)\b/.test( p ) ) {
		features.add( 'comments' );
	}
	if ( /\b(store|shop|sell|product|stripe|payment|checkout|merch)\b/.test( p ) ) {
		features.add( 'store' );
	}
	if ( /\b(contact|form|inquir|enquir)\b/.test( p ) ) {
		features.add( 'forms' );
	}
	if ( /\b(donat|tip(ping)?|patron|support me)\b/.test( p ) ) {
		features.add( 'donations' );
	}
	if ( /\b(member(ship)?s?|premium|paid posts?|paywall|tier)\b/.test( p ) ) {
		features.add( 'memberships' );
	}
	if ( /\b(analy(tic)?s?|stats?|metrics?|traffic)\b/.test( p ) ) {
		features.add( 'analytics' );
	}
	if ( /\b(ai|writing assistant|generate)\b/.test( p ) ) {
		features.add( 'ai-assistant' );
	}

	return { goal, features: Array.from( features ) };
}
