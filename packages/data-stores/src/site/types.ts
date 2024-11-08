import { SiteGoal } from '../onboard';
import * as selectors from './selectors';
import type { ActionCreators } from './actions';
import type { DispatchFromMap, SelectFromMap } from '../mapped-types';
import type { FeatureId } from '../shared-types';

export interface Dispatch {
	dispatch: DispatchFromMap< ActionCreators >;
}

export interface NewSiteBlogDetails {
	url: string;
	blogid: number;
	blogname: string;
	site_slug?: string;
	xmlrpc: string;
}

export interface NewSiteSuccessResponse {
	success: boolean;
	blog_details: NewSiteBlogDetails;
	is_signup_sandbox?: boolean;
}

export interface NewSiteErrorResponse {
	error: string;
	status: number;
	statusCode: number;
	name: string;
	message: string;
}

export interface NewSiteErrorCreateBlog {
	// This has to be `any` as sites/new will return whatever value is passed to it as `$blog_id` if create blog fails.
	blog_id?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type NewSiteResponse =
	| NewSiteSuccessResponse
	| NewSiteErrorResponse
	| NewSiteErrorCreateBlog;

export enum Visibility {
	PublicIndexed = 1,
	PublicNotIndexed = 0,
	Private = -1,
}

export interface CreateSiteParams {
	blog_name: string;
	blog_title?: string;
	authToken?: string;
	public?: Visibility;
	options?: {
		site_vertical?: string;
		site_vertical_name?: string;
		site_vertical_slug?: string;
		site_information?: {
			title?: string;
		};
		lang_id?: number;
		site_creation_flow?: string;
		enable_fse?: boolean;
		theme?: string;
		template?: string;
		timezone_string?: string;
		font_headings?: string;
		font_base?: string;
		use_patterns?: boolean;
		selected_features?: FeatureId[];
		wpcom_public_coming_soon?: number;
		anchor_fm_podcast_id?: string;
		is_blank_canvas?: boolean;
		is_videopress_initial_purchase?: boolean;
		wpcom_admin_interface?: string;
	};
}

export interface P2ThumbnailElements {
	color_link: string;
	color_sidebar_background: string;
	header_image: string | null;
}

export interface SiteFeatures {
	/**
	 * We don't have a `FeatureSlug` yet defined globally
	 * @todo Features are being migrated to calypso-products in other work. Update the type here when one exists
	 */
	active: string[];
	/**
	 * We don't have a `FeatureSlug` yet defined globally
	 * @todo Features are being migrated to calypso-products in other work. Update the type here when one exists
	 */
	available: Record< string, string[] >;
}

export interface SiteDetailsPlan {
	product_id: number;
	product_slug: string;
	product_name: string;
	product_name_short: string;
	expired: boolean;
	billing_period: string;
	user_is_owner: boolean;
	is_free: boolean;
	features: {
		active: string[];
		available: Record< string, string[] >;
	};
}

export interface DifmLiteSiteOptions {
	site_category?: string;
	is_website_content_submitted?: boolean;
	selected_page_titles: string[];
}

// is_fse_active && is_fse_eligible properties have been deprecated and removed from SiteDetails interface
export interface SiteDetails {
	ID: number;
	URL: string;
	capabilities: SiteDetailsCapabilities;
	description: string;
	domain: string;
	icon?: { ico: string; img: string; media_id: number };
	is_coming_soon?: boolean;
	is_multisite?: boolean;
	is_private?: boolean;
	is_deleted?: boolean;
	is_vip?: boolean;
	is_wpcom_atomic?: boolean;
	is_wpcom_staging_site?: boolean;
	is_a4a_client?: boolean;
	is_a4a_dev_site?: boolean;
	jetpack: boolean;
	jetpack_connection?: boolean;
	lang?: string;
	launch_status: string;
	locale: string;
	logo: { id: string; sizes: string[]; url: string };
	name: string | undefined;
	options?: SiteDetailsOptions;
	p2_thumbnail_elements?: P2ThumbnailElements | null;
	plan?: SiteDetailsPlan;
	products?: SiteDetailsPlan[];
	single_user_site?: boolean;
	site_owner?: number;
	slug: string;
	title: string;
	visible?: boolean;
	was_ecommerce_trial?: boolean;
	was_upgraded_from_trial?: boolean;
	was_migration_trial?: boolean;
	was_hosting_trial?: boolean;
	wpcom_url?: string;
	user_interactions?: string[];

	// Jetpack computed properties
	canAutoupdateFiles?: boolean;
	canUpdateFiles?: boolean;
	isMainNetworkSite?: boolean;
	isSecondaryNetworkSite?: boolean;

	// Migration
	site_migration?: SourceSiteMigrationBase;
}

export enum SiteCapabilities {
	ACTIVATE_PLUGINS = 'activate_plugins',
	ACTIVATE_WORDADS = 'activate_wordads',
	DELETE_OTHERS_POSTS = 'delete_others_posts',
	DELETE_USERS = 'delete_users',
	EDIT_OTHERS_PAGES = 'edit_others_pages',
	EDIT_OTHERS_POSTS = 'edit_others_posts',
	EDIT_PAGES = 'edit_pages',
	EDIT_POSTS = 'edit_posts',
	EDIT_THEME_OPTIONS = 'edit_theme_options',
	EDIT_USERS = 'edit_users',
	LIST_USERS = 'list_users',
	MANAGE_CATEGORIES = 'manage_categories',
	MANAGE_OPTIONS = 'manage_options',
	MODERATE_COMMENTS = 'moderate_comments',
	OWN_SITE = 'own_site',
	PROMOTE_USERS = 'promote_users',
	PUBLISH_POSTS = 'publish_posts',
	REMOVE_USERS = 'remove_users',
	UPLOAD_FILES = 'upload_files',
	VIEW_HOSTING = 'view_hosting',
	VIEW_STATS = 'view_stats',
}

export interface SiteDetailsCapabilities {
	activate_plugins: boolean;
	activate_wordads: boolean;
	delete_others_posts: boolean;
	delete_posts: boolean;
	delete_users: boolean;
	edit_others_pages: boolean;
	edit_others_posts: boolean;
	edit_pages: boolean;
	edit_posts: boolean;
	edit_theme_options: boolean;
	edit_users: boolean;
	list_users: boolean;
	manage_categories: boolean;
	manage_options: boolean;
	moderate_comments: boolean;
	own_site: boolean;
	promote_users: boolean;
	publish_posts: boolean;
	remove_users: boolean;
	upload_files: boolean;
	update_plugins: boolean;
	view_hosting: boolean;
	view_stats: boolean;
}

export interface SiteDetailsOptions {
	admin_url?: string;
	advanced_seo_front_page_description?: string;
	advanced_seo_title_formats?: string[];
	ak_vp_bundle_enabled?: boolean | null;
	allowed_file_types?: string[];
	anchor_podcast?: boolean;
	background_color?: boolean;
	blog_public?: number;
	created_at?: string;
	default_category?: number;
	default_comment_status?: boolean;
	default_likes_enabled?: boolean;
	default_ping_status?: boolean;
	default_post_format?: string;
	default_sharing_status?: boolean;
	design_type?: string | null;
	editing_toolkit_is_active?: boolean;
	featured_images_enabled?: boolean;
	frame_nonce?: string;
	gmt_offset?: number;
	header_image?: boolean;
	headstart?: boolean;
	headstart_is_fresh?: boolean;
	image_default_link_type?: string;
	image_large_height?: number;
	image_large_width?: number;
	image_medium_height?: number;
	image_medium_width?: number;
	image_thumbnail_crop?: number;
	image_thumbnail_height?: number;
	image_thumbnail_width?: number;
	import_engine?: string | null;
	is_automated_transfer?: boolean;
	is_cloud_eligible?: boolean;
	is_difm_lite_in_progress?: boolean;
	is_domain_only?: boolean;
	is_mapped_domain?: boolean;
	is_pending_plan?: boolean;
	is_redirect?: boolean;
	is_wpcom_atomic?: boolean;
	is_wpcom_simple?: boolean;
	is_wpcom_store?: boolean;
	is_wpforteams_site?: boolean;
	jetpack_connection_active_plugins?: string[];
	jetpack_frame_nonce?: string;
	jetpack_version?: string | undefined;
	login_url?: string;
	p2_hub_blog_id?: number | null;
	page_for_posts?: number;
	page_on_front?: number;
	permalink_structure?: string;
	podcasting_archive?: boolean | null;
	post_formats?: string[];
	publicize_permanently_disabled?: boolean;
	selected_features?: FeatureId[];
	show_on_front?: string;
	site_intent?: string;
	site_partner_bundle?: string;
	site_goals?: SiteGoal[];
	site_segment?: string | null;
	site_vertical_id?: string | null;
	software_version?: string;
	theme_slug?: string;
	timezone?: string;
	unmapped_url?: string;
	updated_at?: string;
	upgraded_filetypes_enabled?: boolean;
	verification_services_codes?: string | null;
	videopress_enabled?: boolean;
	videopress_storage_used?: number;
	was_created_with_blank_canvas_design?: boolean;
	woocommerce_is_active?: boolean;
	wordads?: boolean;
	launchpad_screen?: false | 'off' | 'full' | 'minimized';
	launchpad_checklist_tasks_statuses?: LaunchPadCheckListTasksStatuses;
	wpcom_production_blog_id?: number;
	wpcom_staging_blog_ids?: number[];
	can_blaze?: boolean;
	blaze_ads_version?: string;
	is_commercial?: boolean | null;
	is_commercial_reasons?: string[];
	wpcom_admin_interface?: string;
}

export type SiteOption = keyof NonNullable< SiteDetails[ 'options' ] >;

export interface SiteError {
	error: string;
	message: string;
}

export type SiteResponse = SiteDetails | SiteError;

export interface Cart {
	blog_id: number;
	cart_key: number;
	coupon: string;
	is_coupon_applied: boolean;
	next_domain_is_free: boolean;
	next_domain_condition: string;
	products: unknown[];
	total_cost: number;
	currency: string;
	total_cost_integer: number;
	temporary: boolean;
	tax: unknown;
	sub_total_integer: number;
	total_tax: number;
	total_tax_integer: number;
	credits: number;
	credits_integer: number;
	allowed_payment_methods: unknown[];
	messages: Record< 'errors' | 'success', unknown >;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Domain {
	a_records_required_for_mapping?: string[];
	primary_domain: boolean;
	blog_id: number;
	connection_mode?: string;
	subscription_id?: any;
	current_user_can_manage: boolean;
	can_set_as_primary: boolean;
	domain: string;
	supports_domain_connect?: any;
	email_forwards_count: number;
	expiry: boolean;
	expiry_soon: boolean;
	expired: boolean;
	auto_renewing: boolean;
	pending_registration: boolean;
	pending_registration_time: string;
	has_registration: boolean;
	points_to_wpcom: boolean;
	privacy_available: boolean;
	private_domain: boolean;
	partner_domain: boolean;
	wpcom_domain: boolean;
	has_pending_contact_update: boolean;
	has_zone: boolean;
	is_renewable: boolean;
	is_redeemable: boolean;
	is_subdomain: boolean;
	is_eligible_for_inbound_transfer: boolean;
	is_locked: boolean;
	is_wpcom_staging_domain: boolean;
	transfer_away_eligible_at?: any;
	type: string;
	registration_date: string;
	auto_renewal_date: string;
	google_apps_subscription?: unknown[];
	titan_mail_subscription?: unknown[];
	pending_whois_update: boolean;
	tld_maintenance_end_time?: any;
	ssl_status?: any;
	subdomain_part?: string;
	supports_gdpr_consent_management: boolean;
	supports_transfer_approval: boolean;
	domain_registration_agreement_url: string;
	contact_info_disclosure_available: boolean;
	contact_info_disclosed: boolean;
	renewable_until?: any;
	redeemable_until?: any;
	bundled_plan_subscription_id?: any;
	product_slug?: any;
	owner: string;
	is_pending_icann_verification?: boolean;
	is_mapped_to_atomic_site: boolean;
}

export interface SiteSettings {
	[ key: string ]: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface SiteLaunchState {
	status: SiteLaunchStatus;
	errorCode: SiteLaunchError | undefined;
}

export enum SiteLaunchError {
	INTERNAL = 'internal',
}

export enum SiteLaunchStatus {
	UNINITIALIZED = 'unintialized',
	IN_PROGRESS = 'in_progress',
	SUCCESS = 'success',
	FAILURE = 'failure',
}

export interface AtomicTransferState {
	status: AtomicTransferStatus;
	errorCode: AtomicTransferError | undefined;
}

export enum AtomicTransferStatus {
	UNINITIALIZED = 'unintialized',
	IN_PROGRESS = 'in_progress',
	SUCCESS = 'success',
	FAILURE = 'failure',
}

export enum AtomicTransferError {
	INTERNAL = 'internal',
}

export interface LatestAtomicTransfer {
	atomic_transfer_id: number;
	blog_id: number;
	status: string;
	created_at: string;
	is_stuck: boolean;
	is_stuck_reset: boolean;
	in_lossless_revert: boolean;
}

export interface LatestAtomicTransferState {
	status: LatestAtomicTransferStatus;
	transfer: LatestAtomicTransfer | undefined;
	errorCode: LatestAtomicTransferError | undefined;
}

export enum LatestAtomicTransferStatus {
	UNINITIALIZED = 'unintialized',
	IN_PROGRESS = 'in_progress',
	SUCCESS = 'success',
	FAILURE = 'failure',
}

export interface LatestAtomicTransferError {
	name: string; // "NotFoundError"
	status: number; // 404
	message: string; // "Transfer not found"
	code: string; // "no_transfer_record"
}

export interface AtomicSoftwareStatus {
	blog_id: number;
	software_set: Record< string, { path: string; state: string } >;
	applied: boolean;
}

export interface AtomicSoftwareStatusError {
	name: string; // "NotFoundError"
	status: number; // 404
	message: string; // "Transfer not found"
	code: string; // "no_transfer_record"
}

export type AtomicSoftwareStatusState = Record<
	string,
	{
		status: AtomicSoftwareStatus | undefined;
		error: AtomicSoftwareStatusError | undefined;
	}
>;

export enum AtomicSoftwareInstallStatus {
	UNINITIALIZED = 'unintialized',
	IN_PROGRESS = 'in_progress',
	SUCCESS = 'success',
	FAILURE = 'failure',
}

export type AtomicSoftwareInstallState = Record<
	string,
	{
		status: AtomicSoftwareInstallStatus | undefined;
		error: AtomicSoftwareInstallError | undefined;
	}
>;

export interface AtomicSoftwareInstallError {
	name: string;
	status: number;
	message: string;
	code: string;
}

interface PaletteColor {
	slug: string;
	color: string;
	name: string;
	default: string;
}

export interface GlobalStyles {
	slug?: string;
	title?: string;
	settings: {
		color: {
			palette: {
				default: PaletteColor[];
				theme: PaletteColor[];
			};
		};
	};
	styles: {
		[ key: string ]: unknown;
	};
}

export interface LaunchPadCheckListTasksStatuses {
	first_post_published?: boolean;
	links_edited?: boolean;
	site_launched?: boolean;
	site_edited?: boolean;
	video_uploaded?: boolean;
	publish_first_course?: boolean;
	domain_upsell_deferred?: boolean;
	plan_selected?: boolean;
	plan_completed?: boolean;
}

export interface ActiveTheme {
	stylesheet: string;
	_links: {
		'wp:user-global-styles': { href: string }[];
	};
	global_styles_id: number | null;
}

export interface CurrentTheme {
	id: string;
}

export type SiteSelect = SelectFromMap< typeof selectors >;

export enum MigrationStatus {
	UNKNOWN = 'unknown',
	INACTIVE = 'inactive',
	NEW = 'new',
	BACKING_UP = 'backing-up',
	BACKING_UP_QUEUED = 'backing-up-queued',
	RESTORING = 'restoring',
	DONE = 'done',
	DONE_USER = 'done-user',
	ERROR = 'error',
}

export enum MigrationStatusError {
	OLD_JETPACK = 'old_jetpack',
	FORBIDDEN = 'forbidden',
	GENERIC = 'error',
	SOURCE_SITE_MULTISITE = 'source_site_multisite',
	SOURCE_SITE_IS_ATOMIC = 'source_site_is_atomic',
	SOURCE_SITE_IS_PROTECTED = 'source_site_is_protected',
	TARGET_SITE_IS_PROTECTED = 'target_site_is_protected',
	NO_START_USER_ADMIN_ON_SOURCE = 'no_start_user_admin_on_source',
	NO_START_USER_ADMIN_ON_TARGET = 'no_start_user_admin_on_target',
	NO_START_SOURCE_IN_PROGRESS = 'no_start_source_in_progress',
	NO_START_TARGET_IN_PROGRESS = 'no_start_target_in_progress',
	WPCOM_MIGRATION_PLUGIN_INCOMPATIBLE = 'wpcom_migration_plugin_incompatible',

	// Start of migration #1
	ACTIVATE_REWIND = 'error-rewind-activate',
	BACKUP_QUEUEING = 'error-backup-queue',

	// Start of backup
	// eslint-disable-next-line inclusive-language/use-inclusive-words
	MISSING_SOURCE_MASTER_USER = 'error-get-master-user',

	// During backup
	NO_BACKUP_STATUS = 'error-backup-status',
	BACKUP_SITE_NOT_ACCESSIBLE = 'error-backup-fail-not-accessible',
	BACKUP_UNKNOWN = 'error-backup-fail-unknown',

	// End of backup
	WOA_GET_TRANSFER_RECORD = 'error-atomic-transfer-get',
	MISSING_WOA_CREDENTIALS = 'error-credentials-atomic',

	// Start of restore
	RESTORE_QUEUE = 'error-restore-queue',
	RESTORE_FAILED = 'error-restore-fail',

	// During restore
	RESTORE_STATUS = 'error-restore-status',

	// End of restore
	FIX_EXTERNAL_USER_ID = 'error-fix-external-user-id',
	GET_SOURCE_EXTERNAL_USER_ID = 'error-get-external-user-id',
	GET_USER_TOKEN = 'error-get-target-user-token',
	UPDATE_TARGET_USER_TOKEN = 'error-update-target-user-token',

	// Start of migration #2
	// End of backup #2
	WOA_TRANSFER = 'error-atomic-transfer',

	// Miscellanous
	GENERAL = 'error-general',
	UNKNOWN = 'error-unknown',
}

export interface SourceSiteMigrationBase {
	source_blog_id?: number;
	error_status?: MigrationStatusError;
	status: MigrationStatus;
	last_modified: string;
	// Migration meta
	recent_migration?: boolean;
	failed_backup_source?: boolean;
	migration_status?: string;
}

export interface SourceSiteMigrationDetails extends SourceSiteMigrationBase {
	target_blog_id?: number;
	site_migration_id: number;
	percent: number;
	created: string;
	is_atomic: boolean;
	// Statistics
	backup_percent?: number;
	backup_size?: number;
	backup_started?: string;
	site_size?: number;
	restore_percent?: number;
	restore_message?: string;
	restore_failure?: string;
	restore_started?: number;
	comments_count?: number;
	plugins_count?: number;
	posts_count?: number;
	tables_count?: number;
	themes_count?: number;
	uploads_count?: number;
	real_percent?: number;
	wp_version?: string;
	// Source site details
	is_target_blog_admin?: boolean;
	is_target_blog_upgraded?: boolean;
	target_blog_slug?: string;
	// Steps details
	step?: number;
	step_name?: string;
	total_steps?: number;
}

export interface Page {
	title: string;
	content: string;
}

export interface AssembleSiteOptions {
	homeHtml?: string;
	headerHtml?: string;
	footerHtml?: string;
	pages?: Page[];
	globalStyles?: GlobalStyles;
	canReplaceContent?: boolean;
	siteSetupOption?: string;
}

/**
 * Site media storage from `/sites/[ siteIdOrSlug ]/media-storage` endpoint
 */
export interface RawSiteMediaStorage {
	max_storage_bytes: number;
	storage_used_bytes: number;
}

/**
 * Site media storage transformed for frontend use
 */
export interface SiteMediaStorage {
	maxStorageBytes: number;
	storageUsedBytes: number;
}
