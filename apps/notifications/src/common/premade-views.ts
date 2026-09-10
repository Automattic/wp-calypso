import { __ } from '@wordpress/i18n';

/**
 * Optional views a user can switch on, each backed by a server-side `type` query.
 *
 * The endpoint derives a note's type from its builder callback, so any real type is
 * filterable; `trophy` is one of the few aliases, covering every `achieve*`/`best*`
 * note without enumerating the ~60 badge types.
 *
 * Pure data on purpose — no store, no renderer — so the settings screen can read the
 * same list the panel renders from.
 */

export type PremadeView = {
	name: string;
	label: string;
	description: string;
	types: string[];
	emptyMessage: string;
};

export const PREMADE_VIEWS: PremadeView[] = [
	{
		name: 'new_posts',
		label: __( 'New posts' ),
		description: __( 'Posts from the sites you subscribe to.' ),
		types: [ 'new_post' ],
		emptyMessage: __( 'No new posts yet.' ),
	},
	{
		name: 'store',
		label: __( 'Store' ),
		description: __( 'Orders and payments from your store.' ),
		types: [ 'store_order', 'simple_payments_payment', 'recurring_payments_note' ],
		emptyMessage: __( 'No orders yet.' ),
	},
	{
		name: 'site_health',
		label: __( 'Site health' ),
		description: __( 'Downtime, backups, scans, and imports.' ),
		types: [
			'jetpack_monitor_note',
			'rewind_scan_result_found',
			'rewind_complete',
			'rewind_download_ready',
			'import_finished',
		],
		emptyMessage: __( 'Nothing needs your attention.' ),
	},
	{
		name: 'billing',
		label: __( 'Billing' ),
		description: __( 'Renewals, payment methods, and expiring plans.' ),
		types: [
			'billing_renewal_success_note',
			'billing_renewal_failure_note',
			'billing_manual_renewal_reminder_note',
			'billing_missing_payment_method_note',
			'plan_expired_revert_note',
			'expired_domain_alert',
		],
		emptyMessage: __( 'No billing updates.' ),
	},
	{
		name: 'achievements',
		label: __( 'Achievements' ),
		description: __( 'Badges, streaks, and milestones.' ),
		types: [ 'trophy' ],
		emptyMessage: __( 'No achievements yet.' ),
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
