import { __, _n, sprintf } from '@wordpress/i18n';
import { formatCreditsShort } from './credits';

/** Who may buy, from the `/ai/credits` response. A turn's final update doesn't carry it. */
export interface CreditsAccess {
	canBuyCredits?: boolean;
	canUpgrade?: boolean;
}

/** Who to ask, for people who can't upgrade the plan themselves. */
export type CreditsAskToUpgrade = 'site-admin' | 'plan-owner';

export interface CreditsPurchaseOptions {
	upgradeUrl?: string;
	askToUpgrade?: CreditsAskToUpgrade;
	/** The dot's details message, shown in place of Upgrade. */
	purchaseHint?: string;
}

/** Leaves out any flag that isn't a boolean, as from an older server or one that can't tell. */
export function parseCreditsAccess( data: unknown ): CreditsAccess {
	const { can_buy_credits: canBuyCredits, can_upgrade: canUpgrade } =
		data && typeof data === 'object' ? ( data as Record< string, unknown > ) : {};
	return {
		canBuyCredits: typeof canBuyCredits === 'boolean' ? canBuyCredits : undefined,
		canUpgrade: typeof canUpgrade === 'boolean' ? canUpgrade : undefined,
	};
}

/**
 * Upgrade only when checkout would accept it. Everyone else on a plan with an upgrade is
 * told who can buy, or nothing when the server can't say.
 */
export function getCreditsPurchaseOptions(
	planUpgradeUrl: string | undefined,
	access: CreditsAccess | undefined
): CreditsPurchaseOptions {
	if ( ! planUpgradeUrl ) {
		return {};
	}
	if ( access?.canUpgrade === true ) {
		return { upgradeUrl: planUpgradeUrl };
	}
	if ( access?.canBuyCredits === false ) {
		return {
			askToUpgrade: 'site-admin',
			purchaseHint: __( 'Ask a site admin to add more.', __i18n_text_domain__ ),
		};
	}
	if ( access?.canUpgrade === false ) {
		return {
			askToUpgrade: 'plan-owner',
			purchaseHint: __(
				'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.',
				__i18n_text_domain__
			),
		};
	}
	return {};
}

/** The low or zero-balance notice for site credits, with who to ask when the reader can't upgrade. */
export function getCreditsNoticeMessage(
	level: 'low' | 'out',
	remaining: number,
	askToUpgrade?: CreditsAskToUpgrade
): string {
	if ( level === 'out' ) {
		if ( askToUpgrade === 'site-admin' ) {
			return __(
				'You’ve used all your site credits. Ask a site admin to add more.',
				__i18n_text_domain__
			);
		}
		if ( askToUpgrade === 'plan-owner' ) {
			return __(
				'You’ve used all your site credits. Ask the plan owner to upgrade.',
				__i18n_text_domain__
			);
		}
		return __( 'You’ve used all your site credits.', __i18n_text_domain__ );
	}
	if ( askToUpgrade === 'site-admin' ) {
		return sprintf(
			/* translators: %s: site credits left in short form, e.g. "800" or "8.5k" */
			_n(
				'%s credit left. Ask a site admin to add more.',
				'%s credits left. Ask a site admin to add more.',
				remaining,
				__i18n_text_domain__
			),
			formatCreditsShort( remaining )
		);
	}
	if ( askToUpgrade === 'plan-owner' ) {
		return sprintf(
			/* translators: %s: site credits left in short form, e.g. "800" or "8.5k" */
			_n(
				'%s credit left. Ask the plan owner to upgrade.',
				'%s credits left. Ask the plan owner to upgrade.',
				remaining,
				__i18n_text_domain__
			),
			formatCreditsShort( remaining )
		);
	}
	return sprintf(
		/* translators: %s: site credits left in short form, e.g. "800" or "8.5k" */
		_n( '%s credit left.', '%s credits left.', remaining, __i18n_text_domain__ ),
		formatCreditsShort( remaining )
	);
}
