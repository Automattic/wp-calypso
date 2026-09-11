import { __ } from '@wordpress/i18n';

/**
 * Optional views a user can switch on, each backed by a server-side `type` query.
 *
 * Grouped by where a notification came from — your sites, your store, other people,
 * what you follow, or WordPress.com itself — rather than by what kind of event it is.
 * The endpoint derives a note's type from its builder callback, so any real type is
 * filterable.
 */

export type PremadeView = {
	name: string;
	label: string;
	types: string[];
	emptyMessage: string;
};

export const PREMADE_VIEWS: PremadeView[] = [
	{
		name: 'sites',
		label: __( 'Sites' ),
		types: [
			'scheduled_post_published',
			'published_scheduled_publicize_notif',
			'import_finished',
			'site_migration_pending_note',
			'privacy_change',
			'disk_quota_used',
			'atomic_email_blocked_note',
			'invalid_support_address',
			'asc_profile_regeneration_started',
			'asc_profile_regeneration_finished',
			'colourlovers_deprecation_note',
			'jetpack_monitor_note',
			'rewind_scan_result_found',
			'rewind_complete',
			'rewind_download_ready',
			'rewind_backup_initial',
			'vaultpress_security_notification',
			'billing_renewal_success_note',
			'billing_renewal_failure_note',
			'billing_manual_renewal_reminder_note',
			'billing_missing_payment_method_note',
			'billing_credit_card_expired_note',
			'plan_expired_revert_note',
			'expired_domain_alert',
			'free_trial_end',
			'jetpack_plan_transfer_new_owner',
			'jetpack_plan_transfer_original_owner',
			'updated_ads_tos_note',
		],
		emptyMessage: __( 'Nothing needs your attention.' ),
	},
	{
		name: 'store',
		label: __( 'Store' ),
		types: [
			'store_order',
			'simple_payments_payment',
			'recurring_payments_note',
			'wordads_payout_note',
			'blaze_approved_note',
			'blaze_performed_note',
			'blaze_cancelled_note',
			'blaze_rejected_note',
		],
		emptyMessage: __( 'No orders yet.' ),
	},
	{
		name: 'interactions',
		label: __( 'Interactions' ),
		types: [
			'comment',
			'like',
			'comment_like',
			'reblog',
			'follow',
			'automattcher',
			'form_response_received',
			'activitypub_interaction_note',
			'activitypub_followed_note',
			'wpcom_forums_reply',
			'private_blog_access_requested_note',
			'invite_user',
		],
		emptyMessage: __( 'No interactions yet.' ),
	},
	{
		name: 'following',
		label: __( 'Following' ),
		types: [ 'new_post' ],
		emptyMessage: __( 'No new posts yet.' ),
	},
	{
		name: 'wordpress_com',
		label: __( 'WordPress.com' ),
		// `trophy` is a server-side alias for the achieve/best name prefixes, so it stands
		// in for the ~60 badge types rather than listing them.
		types: [
			'trophy',
			'traffic_surge',
			'view_milestone',
			'notify_posted_on_this_day',
			'a8c_wrapped',
			'user_goal_met',
			'blogging_prompts_note',
			'welcome_to_wordpress_com',
			'mobile_quick_start_success',
			'magic_login_link_used_note',
			'qr_code_used_note',
			'qr_app_login_used_note',
			'social_login_connection',
			'removed_social_connection',
			'graylist_flag_alert',
			'bbe_upsell_note',
			'plan_setup_nudge',
			'storage_upgrade_notification',
			'jetpack_recommendation_note',
		],
		emptyMessage: __( 'Nothing from WordPress.com yet.' ),
	},
];

export const getPremadeView = ( name: string ) =>
	PREMADE_VIEWS.find( ( view ) => view.name === name );

/**
 * A premade view in the shape the panel's filters use.
 *
 * `filter` is permissive because the server owns membership here: these views only
 * ever render the server's filtered id list, never the unfiltered store, and nothing
 * a user does in the app changes a note's type.
 */
export const getPremadeFilter = ( name: string ) => {
	const view = getPremadeView( name );

	if ( ! view ) {
		return undefined;
	}

	return {
		name: view.name,
		label: view.label,
		emptyMessage: view.emptyMessage,
		query: { type: view.types.join( ',' ) },
		filter: () => true,
	};
};

// Always shown, always first, and never stored in the user's view list.
export const PINNED_VIEW_NAMES = [ 'all', 'unread' ];

export type StoredView = {
	name: string;
	hidden?: boolean;
};

type KnownView = {
	name: string;
	label: string;
	isPremade: boolean;
};

/**
 * Apply the user's stored order and visibility to the views the panel knows about.
 *
 * A view the list doesn't mention keeps its default — the panel's own views are shown,
 * optional premade ones are not — and lands after the ones that are mentioned, so a view
 * added later appears on its own instead of waiting for a re-save.
 */
export const resolveViewOrder = ( known: KnownView[], stored: StoredView[] = [] ) => {
	const byName = new Map( known.map( ( view ) => [ view.name, view ] ) );
	const pinned = PINNED_VIEW_NAMES.map( ( name ) => byName.get( name ) ).filter(
		( view ): view is KnownView => !! view
	);

	const mentioned = stored
		.filter( ( { name } ) => ! PINNED_VIEW_NAMES.includes( name ) )
		.map( ( { name, hidden } ) => {
			const view = byName.get( name );
			return view ? { view, hidden: !! hidden } : undefined;
		} )
		.filter( ( entry ): entry is { view: KnownView; hidden: boolean } => !! entry );

	const mentionedNames = new Set( mentioned.map( ( { view } ) => view.name ) );
	const rest = known
		.filter(
			( view ) => ! PINNED_VIEW_NAMES.includes( view.name ) && ! mentionedNames.has( view.name )
		)
		.map( ( view ) => ( { view, hidden: view.isPremade } ) );

	return [ ...pinned.map( ( view ) => ( { view, hidden: false } ) ), ...mentioned, ...rest ];
};
