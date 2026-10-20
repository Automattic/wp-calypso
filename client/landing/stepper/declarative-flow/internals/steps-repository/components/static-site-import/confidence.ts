import type { StaticSiteImportPreviewSummary } from '@automattic/api-core';

/** Parts of a site the import can't recreate; the user has to rebuild them on WordPress.com. */
export type StaticSiteImportBlocker = 'store' | 'bookings' | 'membership';

/** Parts that come across but need a hand after the move. */
export type StaticSiteImportSetupItem = 'form' | 'embeds' | 'sections' | 'layout' | 'pages';

export type StaticSiteImportOutcome = 'everything' | 'almost-everything' | 'manual-work';

export interface StaticSiteImportConfidence {
	outcome: StaticSiteImportOutcome;
	blockers: StaticSiteImportBlocker[];
	setup: StaticSiteImportSetupItem[];
	/** False when we only saw a sample of the site, or couldn't inspect it at all. */
	isComplete: boolean;
}

export function getStaticSiteImportConfidence(
	summary?: StaticSiteImportPreviewSummary
): StaticSiteImportConfidence {
	const inspection = summary?.inspection;
	const fidelity = summary?.fidelity;
	const found = inspection?.measured ? ( inspection.capabilities ?? {} ) : {};
	const pages = summary?.pages ?? 0;

	const blockers: StaticSiteImportBlocker[] = [];
	if ( found.commerce ) {
		blockers.push( 'store' );
	}
	if ( found.booking ) {
		blockers.push( 'bookings' );
	}
	if ( found.membership ) {
		blockers.push( 'membership' );
	}

	const setup: StaticSiteImportSetupItem[] = [];
	// Forms are rebuilt as blocks, but nothing checks that submissions still reach the owner.
	if ( found.forms ) {
		setup.push( 'form' );
	}
	if ( found.embeds ) {
		setup.push( 'embeds' );
	}
	if (
		summary?.quality_pass === false ||
		Boolean( summary?.content_loss ) ||
		Boolean( summary?.fallback_blocks ) ||
		Boolean( summary?.invalid_blocks )
	) {
		setup.push( 'sections' );
	}
	if ( fidelity?.measured && fidelity.pass === false ) {
		setup.push( 'layout' );
	}
	if ( inspection?.measured && pages && ( inspection.routes ?? 0 ) > pages ) {
		setup.push( 'pages' );
	}

	let outcome: StaticSiteImportOutcome = 'everything';
	if ( blockers.length ) {
		outcome = 'manual-work';
	} else if ( setup.length ) {
		outcome = 'almost-everything';
	}

	return {
		outcome,
		blockers,
		setup,
		isComplete: Boolean( inspection?.measured && inspection.confidence === 'bounded-sample' ),
	};
}
