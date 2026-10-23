import { __, _n, sprintf } from '@wordpress/i18n';
import { formatCreditsShort } from './credits';
import type { CreditsPurchaseKind, CreditsPurchaseLink } from './live-credits';
import type { NoticeConfig } from '@automattic/agenttic-ui';

/** Who may buy, from the `/ai/credits` response. A turn's final update doesn't carry it. */
export interface CreditsAccess {
	canBuyCredits?: boolean;
	canUpgrade?: boolean;
}

/** Who to ask, for people who can't buy what the plan offers themselves. */
export type CreditsAskToUpgrade = 'site-admin' | 'plan-owner';

/** The call to action a credits notice shows, as Tracks events report it. */
export type CreditsCtaType = CreditsPurchaseKind | 'contact_admin' | 'contact_plan_owner' | 'none';

export interface CreditsPurchaseOptions {
	/** Upgrade or Add credits, for someone checkout would sell it to. */
	purchaseUrl?: string;
	/** Which purchase `purchaseUrl` starts; set together with it. */
	purchaseKind?: CreditsPurchaseKind;
	askToUpgrade?: CreditsAskToUpgrade;
	/** The meter's details message, shown in place of the purchase button. */
	purchaseHint?: string;
}

/** A purchase link, shaped like the chat notice's link action so one object serves the notice and the meter. */
export interface CreditsPurchaseAction {
	label: string;
	href: string;
	target?: string;
	rel?: string;
	/** Runs before the link opens, for example to record the click. */
	onClick?: () => void;
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

function getAskSiteAdminOptions(): CreditsPurchaseOptions {
	return {
		askToUpgrade: 'site-admin',
		purchaseHint: __( 'Ask a site admin to add more.', __i18n_text_domain__ ),
	};
}

/**
 * The plan's purchase link only when checkout would accept it. Any site admin can buy a
 * credits pack, but only the plan buyer can upgrade. Everyone else is told who can buy,
 * and nothing shows when the server can't say.
 */
export function getCreditsPurchaseOptions(
	planPurchaseLink: CreditsPurchaseLink | undefined,
	access: CreditsAccess | undefined
): CreditsPurchaseOptions {
	if ( ! planPurchaseLink ) {
		return {};
	}
	const offer = { purchaseUrl: planPurchaseLink.url, purchaseKind: planPurchaseLink.kind };
	if ( planPurchaseLink.kind === 'top_up' ) {
		if ( access?.canBuyCredits === true ) {
			return offer;
		}
		return access?.canBuyCredits === false ? getAskSiteAdminOptions() : {};
	}
	if ( access?.canUpgrade === true ) {
		return offer;
	}
	if ( access?.canUpgrade !== false ) {
		return {};
	}
	if ( access.canBuyCredits === false ) {
		return getAskSiteAdminOptions();
	}
	return {
		askToUpgrade: 'plan-owner',
		purchaseHint: __(
			'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.',
			__i18n_text_domain__
		),
	};
}

/** The Upgrade or Add credits button. It opens a new tab, so the chat and its draft stay. */
export function getCreditsPurchaseAction( {
	purchaseUrl,
	purchaseKind,
}: CreditsPurchaseOptions ): CreditsPurchaseAction | undefined {
	if ( ! purchaseUrl || ! purchaseKind ) {
		return undefined;
	}
	return {
		label:
			purchaseKind === 'top_up'
				? __( 'Add credits', __i18n_text_domain__ )
				: __( 'Upgrade', __i18n_text_domain__ ),
		href: purchaseUrl,
		target: '_blank',
		rel: 'noopener noreferrer',
	};
}

/** The call to action the notice shows: the purchase link, or who to ask. */
export function getCreditsCtaType(
	purchaseKind: CreditsPurchaseKind | undefined,
	askToUpgrade?: CreditsAskToUpgrade
): CreditsCtaType {
	if ( purchaseKind ) {
		return purchaseKind;
	}
	if ( askToUpgrade === 'site-admin' ) {
		return 'contact_admin';
	}
	if ( askToUpgrade === 'plan-owner' ) {
		return 'contact_plan_owner';
	}

	return 'none';
}

/** The low or zero-balance notice for site credits, with who to ask when the reader can't buy. */
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

/** The zero-balance notice, which stays until the balance changes. */
export function getCreditsOutNotice(
	remaining: number,
	askToUpgrade: CreditsAskToUpgrade | undefined,
	action: CreditsPurchaseAction | undefined
): NoticeConfig {
	return {
		icon: false,
		message: getCreditsNoticeMessage( 'out', remaining, askToUpgrade ),
		action,
		dismissible: false,
	};
}

/**
 * The card in the thread for a reply refused for no credits, with the purchase as its link
 * and words that match it. Someone who can't buy gets the title alone; the composer's
 * notice says who may buy.
 */
export function getCreditsRefusalNotice(
	purchaseKind: CreditsPurchaseKind | undefined,
	action: CreditsPurchaseAction | undefined
): NoticeConfig {
	let message = '';
	if ( action ) {
		message =
			purchaseKind === 'top_up'
				? __( 'Add credits to keep working.', __i18n_text_domain__ )
				: __( 'Upgrade to keep working.', __i18n_text_domain__ );
	}
	return {
		icon: false,
		title: __( 'Your message wasn’t sent', __i18n_text_domain__ ),
		message,
		action,
		dismissible: false,
	};
}

/** After a reply refused for no credits, once the balance is above 0 again, with Try again where the chat can resend. */
export function getCreditsBackNotice( action?: NoticeConfig[ 'action' ] ): NoticeConfig {
	return {
		icon: false,
		message: __( 'Your site has credits again.', __i18n_text_domain__ ),
		action,
		dismissible: false,
	};
}
