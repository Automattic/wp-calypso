import type { __ as translate } from '@wordpress/i18n';

type ErrorPreset = {
	title: string;
	subtitle: string;
	buttonText: string;
	buttonUrl: string;
};

export function getErrorPreset( querystring: string, __: typeof translate ): ErrorPreset {
	const pressableAction = {
		buttonText: __( 'Return to Pressable' ),
		buttonUrl: 'https://my.pressable.com/',
	};
	const homeAction = { buttonText: __( 'Return home' ), buttonUrl: '/' };
	const genericPreset: ErrorPreset = {
		title: __( 'Something went wrong' ),
		subtitle: __( 'We couldn’t complete your request. Please try again.' ),
		...homeAction,
	};
	const invalidRequest: ErrorPreset = {
		title: __( 'Invalid checkout request' ),
		subtitle: __( 'This checkout request is invalid. Please try again from Pressable.' ),
		...pressableAction,
	};
	const subscriptionMismatch: ErrorPreset = {
		title: __( 'Inbox subscription mismatch' ),
		subtitle: __(
			'We couldn’t match the inbox subscription to the agency license. Please contact Pressable.'
		),
		...pressableAction,
	};
	const orderNeedsReview: ErrorPreset = {
		title: __( 'Inbox order needs review' ),
		subtitle: __(
			'Your existing inbox order needs review before checkout. Please contact Pressable.'
		),
		...pressableAction,
	};
	const cartPreparation: ErrorPreset = {
		title: __( 'Unable to prepare checkout' ),
		subtitle: __(
			'We couldn’t prepare your inbox order for checkout. Please try again from Pressable.'
		),
		...pressableAction,
	};
	const accessTitle = __( 'Unable to access checkout' );
	const presets: Record< string, ErrorPreset > = {
		a4a_pressable_titan_redirect_expired: {
			title: __( 'Checkout link expired' ),
			subtitle: __( 'This link has expired. Request a new link from Pressable.' ),
			...pressableAction,
		},
		a4a_pressable_titan_redirect_rejected: {
			title: __( 'Unable to verify checkout' ),
			subtitle: __( 'The redirect could not be verified.' ),
			...pressableAction,
		},
		a4a_pressable_titan_missing_parameters: {
			title: __( 'Incomplete checkout link' ),
			subtitle: __(
				'This checkout link is missing required information. Request a new link from Pressable.'
			),
			...pressableAction,
		},
		a4a_pressable_titan_invalid_parameters: invalidRequest,
		a4a_pressable_titan_unexpected_request_body: invalidRequest,
		a4a_pressable_titan_invalid_domain: {
			title: __( 'Invalid domain' ),
			subtitle: __( 'This checkout link has an invalid domain. Please try again from Pressable.' ),
			...pressableAction,
		},
		a4a_pressable_titan_agency_not_found: {
			title: __( 'Agency not found' ),
			subtitle: __( 'We couldn’t find the agency for this checkout. Please contact Pressable.' ),
			...pressableAction,
		},
		a4a_pressable_titan_unknown_buyer: {
			title: __( 'Buyer not found' ),
			subtitle: __(
				'We couldn’t find a WordPress.com account for the buyer. Please contact Pressable.'
			),
			...pressableAction,
		},
		a4a_pressable_titan_unauthorized_buyer: {
			title: accessTitle,
			subtitle: __(
				'The buyer doesn’t have permission to purchase inboxes for this agency. Contact an agency owner or manager.'
			),
			...pressableAction,
		},
		a4a_pressable_titan_agency_not_approved: {
			title: accessTitle,
			subtitle: __( 'Your agency must be approved before purchasing inboxes.' ),
			...pressableAction,
		},
		a4a_pressable_titan_billing_dragon_required: {
			title: accessTitle,
			subtitle: __(
				'Your agency’s current billing system does not support Pressable add-ons. Please contact A4A Support for help.'
			),
			...pressableAction,
		},
		a4a_pressable_titan_subscription_owner_mismatch: {
			title: accessTitle,
			subtitle: __( 'Only the subscription owner can update these inboxes.' ),
			...pressableAction,
		},
		a4a_pressable_titan_invalid_plan: {
			title: __( 'Inbox plan unavailable' ),
			subtitle: __(
				'This inbox plan isn’t available through this checkout. Please try again from Pressable.'
			),
			...pressableAction,
		},
		a4a_pressable_titan_invalid_quantity: {
			title: __( 'Invalid inbox quantity' ),
			subtitle: __( 'The number of inboxes is invalid. Please try again from Pressable.' ),
			...pressableAction,
		},
		a4a_pressable_titan_invalid_trial_flag: {
			title: __( 'Invalid trial information' ),
			subtitle: __(
				'The trial information in this checkout link is invalid. Request a new link from Pressable.'
			),
			...pressableAction,
		},
		a4a_pressable_titan_order_changed: {
			title: __( 'Inbox order changed' ),
			subtitle: __(
				'Your inbox order has changed. Please start again from Pressable to review the updated order.'
			),
			...pressableAction,
		},
		a4a_pressable_titan_license_plan_mismatch: {
			title: __( 'Inbox plan mismatch' ),
			subtitle: __( 'The existing inbox license uses a different plan. Please contact Pressable.' ),
			...pressableAction,
		},
		a4a_pressable_titan_unlinked_subscription: subscriptionMismatch,
		a4a_pressable_titan_subscription_mismatch: subscriptionMismatch,
		a4a_pressable_titan_ownership_mismatch: subscriptionMismatch,
		a4a_pressable_titan_duplicate_subscription_state: orderNeedsReview,
		a4a_pressable_titan_duplicate_license_state: orderNeedsReview,
		a4a_pressable_titan_legacy_subscription: orderNeedsReview,
		a4a_pressable_titan_cart_mismatch: cartPreparation,
		a4a_pressable_titan_cart_replacement_required: cartPreparation,
		a4a_pressable_titan_requires_a4a_checkout: cartPreparation,
		a4a_pressable_titan_single_item_checkout: cartPreparation,
		a4a_pressable_titan_unknown: {
			title: genericPreset.title,
			subtitle: __( 'We couldn’t open checkout. Please try again from Pressable.' ),
			...pressableAction,
		},
	};
	const params = new URLSearchParams( querystring );
	const codes = params.getAll( 'code' );
	const code = codes.length === 1 ? codes[ 0 ] : undefined;
	const preset =
		code !== undefined && Object.prototype.hasOwnProperty.call( presets, code )
			? presets[ code ]
			: genericPreset;
	const destinations = params.getAll( 'return_to' );
	if ( destinations.length === 1 ) {
		if ( destinations[ 0 ] === 'pressable' ) {
			return { ...preset, ...pressableAction };
		}
		if ( destinations[ 0 ] === 'home' ) {
			return { ...preset, ...homeAction };
		}
	}
	return preset;
}
