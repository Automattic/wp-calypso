import { TranslateResult } from 'i18n-calypso';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

// All types based on which the data is populated on the agency dashboard table rows
export type AllowedTypes =
	| 'site'
	| 'stats'
	| 'boost'
	| 'backup'
	| 'scan'
	| 'monitor'
	| 'plugin'
	| 'error';

// Site column object which holds key and title of each column
export type SiteColumns = Array< {
	key: AllowedTypes;
	title: string;
	className?: string;
	isExpandable?: boolean;
	isSortable?: boolean;
	showInfo?: boolean;
} >;

export type AllowedStatusTypes =
	| 'active'
	| 'inactive'
	| 'progress'
	| 'failed'
	| 'warning'
	| 'success'
	| 'disabled'
	| 'critical';

interface MonitorContactEmail {
	name: string;
	email_address: string;
	verified: boolean;
}
interface MonitorContactSMS {
	name: string;
	sms_number: string;
	number: string;
	country_code: string;
	country_numeric_code: string;
	verified: boolean;
}
interface MonitorContacts {
	emails?: Array< MonitorContactEmail >;
	sms_numbers?: Array< MonitorContactSMS >;
}

export interface MonitorSettings {
	monitor_active: boolean;
	monitor_site_status: boolean;
	last_down_time: string;
	check_interval: number;
	monitor_user_emails: Array< string >;
	monitor_user_email_notifications: boolean;
	monitor_user_sms_notifications: boolean;
	monitor_user_wp_note_notifications: boolean;
	monitor_notify_additional_user_emails: Array< MonitorContactEmail >;
	monitor_notify_additional_user_sms: Array< MonitorContactSMS >;
	is_over_limit: boolean;
	sms_sent_count: number;
	sms_monthly_limit: number;
}

interface StatsObject {
	total: number;
	trend: 'up' | 'down' | 'same';
	trend_change: number;
}
export interface SiteStats {
	views: StatsObject;
	visitors: StatsObject;
}

export interface BoostData {
	overall: number;
	mobile: number;
	desktop: number;
}

export interface Site {
	sticker: string[];
	blog_id: number;
	blogname: string;
	url: string;
	url_with_scheme: string;
	monitor_active: boolean;
	monitor_site_status: boolean;
	has_scan: boolean;
	has_backup: boolean;
	has_boost: boolean;
	latest_scan_threats_found: Array< string >;
	latest_backup_status: string;
	is_connection_healthy: boolean;
	awaiting_plugin_updates: Array< string >;
	multisite: boolean;
	is_favorite: boolean;
	monitor_settings: MonitorSettings;
	monitor_last_status_change: string;
	isSelected?: boolean;
	site_stats: SiteStats;
	onSelect?: () => void;
	jetpack_boost_scores: BoostData;
	php_version_num: number;
	php_version: string;
	wordpress_version: string;
	hosting_provider_guess: string;
	has_paid_agency_monitor: boolean;
	is_atomic: boolean;
	has_pending_boost_one_time_score: boolean;
	has_vulnerable_plugins: boolean;
	latest_scan_has_threats_found: boolean;
	active_paid_subscription_slugs: Array< string >;
	site_color?: string;
	enabled_plugin_slugs?: Array< string >;
	a4a_site_id?: number;
}
export interface SiteNode {
	value: Site;
	error: boolean;
	type: AllowedTypes;
	status: AllowedStatusTypes;
}

export interface StatsNode {
	type: AllowedTypes;
	status: AllowedStatusTypes;
	value: SiteStats;
}

export interface BoostNode {
	type: AllowedTypes;
	status: AllowedStatusTypes;
	value: BoostData;
}
export interface BackupNode {
	type: AllowedTypes;
	status: AllowedStatusTypes;
	value: string;
}

export interface ScanNode {
	type: AllowedTypes;
	status: AllowedStatusTypes;
	value: string;
	threats: number;
}

export interface PluginNode {
	type: AllowedTypes;
	status: AllowedStatusTypes;
	value: string;
	updates: number;
}
export interface MonitorNode {
	type: AllowedTypes;
	status: AllowedStatusTypes;
	value: string;
	error?: boolean;
	settings?: MonitorSettings;
}
export interface ErrorNode {
	type: AllowedTypes;
	status: AllowedStatusTypes;
	value: string;
}
export interface SiteData {
	site: SiteNode;
	stats: StatsNode;
	boost: BoostNode;
	backup: BackupNode;
	scan: ScanNode;
	plugin: PluginNode;
	monitor: MonitorNode;
	error: ErrorNode;
	isDevSite?: boolean;
	isFavorite?: boolean;
	isSelected?: boolean;
	onSelect?: () => void;
	ref?: string | number;
}

export interface RowMetaData {
	row: {
		value: Site | SiteStats | BoostData | string;
		status: AllowedStatusTypes;
	};
	link: string;
	isExternalLink: boolean;
	tooltip?: TranslateResult;
	tooltipId: string;
	siteDown?: boolean;
	isSupported: boolean;
	eventName: string | undefined;
}

export type PreferenceType = 'dismiss' | 'view' | 'view_date';

export type Preference = {
	dismiss?: boolean;
	view?: boolean;
	view_date?: string;
};

export type StatusEventNames = {
	[ key in AllowedStatusTypes ]?: { small_screen: string; large_screen: string };
};

export type StatusTooltip = {
	[ key in AllowedStatusTypes ]?: string;
};

export type AllowedActionTypes =
	| 'issue_license'
	| 'view_activity'
	| 'view_site'
	| 'visit_wp_admin'
	| 'clone_site'
	| 'site_settings'
	| 'set_up_site'
	| 'change_domain'
	| 'hosting_configuration'
	| 'remove_site'
	| 'prepare_for_launch';

export type ActionEventNames = {
	[ key in AllowedActionTypes ]: { small_screen: string; large_screen: string };
};

export interface DashboardSortInterface {
	field: string;
	direction: 'asc' | 'desc' | '';
}
export interface DashboardOverviewContextInterface {
	path: string;
	search: string;
	currentPage: number;
	filter: { issueTypes: Array< AgencyDashboardFilterOption >; showOnlyFavorites: boolean };
	sort: DashboardSortInterface;
	showSitesDashboardV2: boolean;
}

export interface SitesOverviewContextInterface extends DashboardOverviewContextInterface {
	isBulkManagementActive: boolean;
	setIsBulkManagementActive: ( value: boolean ) => void;
	selectedSites: Array< Site >;
	setSelectedSites: ( value: Array< Site > ) => void;
	currentLicenseInfo: string | null;
	showLicenseInfo: ( license: string ) => void;
	hideLicenseInfo: () => void;
	mostRecentConnectedSite: string | null;
	setMostRecentConnectedSite: ( mostRecentConnectedSite: string ) => void;
	isPopoverOpen: boolean;
	setIsPopoverOpen: React.Dispatch< React.SetStateAction< boolean > >;
}

export interface DashboardDataContextInterface {
	verifiedContacts: {
		emails: Array< string >;
		phoneNumbers: Array< string >;
		refetchIfFailed: () => void;
	};
	products: APIProductFamilyProduct[];
	isLargeScreen: boolean;
}

export type AgencyDashboardFilterOption =
	| 'all_issues'
	| 'backup_failed'
	| 'backup_warning'
	| 'threats_found'
	| 'site_disconnected'
	| 'site_down'
	| 'plugin_updates';

export interface AgencyDashboardFilterMap {
	filterType: AgencyDashboardFilterOption;
	ref: number;
}

export type AgencyDashboardFilter = {
	issueTypes: Array< AgencyDashboardFilterOption >;
	showOnlyFavorites: boolean;
	isNotMultisite?: boolean;
};

export type ProductInfo = { name: string; key: string; status: 'rejected' | 'fulfilled' };

export type PurchasedProductsInfo = {
	selectedSite: string;
	selectedProducts: Array< ProductInfo >;
	type?: string;
};

export interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: any;
}

export interface APIToggleFavorite {
	[ key: string ]: any;
}

export interface ToggleFavoriteOptions {
	siteId: number;
	isFavorite: boolean;
	agencyId?: number;
}

interface MonitorURLS {
	monitor_url: string;
	options: Array< string >;
	check_interval: number;
}

export interface UpdateMonitorSettingsAPIResponse {
	success: boolean;
	settings: {
		email_notifications: boolean;
		sms_notifications: boolean;
		wp_note_notifications: boolean;
		contacts?: MonitorContacts;
		urls?: MonitorURLS[];
	};
}

export interface UpdateMonitorSettingsParams {
	wp_note_notifications?: boolean;
	email_notifications?: boolean;
	sms_notifications?: boolean;
	contacts?: MonitorContacts;
	urls?: MonitorURLS[];
}
export interface UpdateMonitorSettingsArgs {
	siteId: number;
	params: UpdateMonitorSettingsParams;
}

export interface SubmitProductFeedbackParams {
	rating: number;
	feedback: string;
	source_url: string;
}

export type SiteMonitorStatus = {
	[ siteId: number ]: 'loading' | 'completed';
};

export interface ToggleActivaateMonitorAPIResponse {
	code: 'success' | 'error';
	message: string;
}
export interface ToggleActivateMonitorArgs {
	siteId: number;
	params: { monitor_active: boolean };
	hasJetpackPluginInstalled: boolean;
	agencyId?: number;
}

export interface Backup {
	activityTitle: string;
	activityDescription: { children: { text: string }[] }[];
	activityName: string;
	activityTs: number;
}

export type AllowedMonitorPeriods = 'day' | 'week' | '30 days' | '90 days';

export interface MonitorUptimeAPIResponse {
	[ key: string ]: { status: string; downtime_in_minutes?: number };
}

export interface MonitorSettingsEmail {
	email: string;
	name: string;
	verified: boolean;
}

export interface StateMonitorSettingsSMS {
	name: string;
	countryCode: string;
	countryNumericCode: string;
	phoneNumber: string;
	phoneNumberFull: string;
	verified: boolean;
}

export interface StateMonitorSettingsEmail extends MonitorSettingsEmail {
	isDefault?: boolean;
}

export interface StateMonitorSettingsSMS {
	name: string;
	countryCode: string;
	phoneNumber: string;
	phoneNumberFull: string;
	verified: boolean;
}

export type MonitorSettingsContact = Partial< MonitorSettingsEmail > &
	Partial< StateMonitorSettingsSMS >;

export type AllowedMonitorContactActions = 'add' | 'verify' | 'edit' | 'remove';

export type AllowedMonitorContactTypes = 'email' | 'sms';

export type StateMonitoringSettingsContact = StateMonitorSettingsEmail | StateMonitorSettingsSMS;

export interface RequestVerificationCodeParams {
	type: AllowedMonitorContactTypes;
	value: string;
	site_ids: Array< number >;
	// For SMS contacts
	number?: string;
	country_code?: string;
	country_numeric_code?: string;
}

export interface ValidateVerificationCodeParams {
	type: AllowedMonitorContactTypes;
	value: string;
	verification_code: number;
}

export interface MonitorContactsResponse {
	emails: [ { verified: boolean; email_address: string } ];
	sms_numbers: [ { verified: boolean; sms_number: string; country_numeric_code: string } ];
}

export type MonitorDuration = { label: string; time: number };

export interface InitialMonitorSettings {
	enableSMSNotification: boolean;
	enableEmailNotification: boolean;
	enableMobileNotification: boolean;
	selectedDuration: MonitorDuration | undefined;
	emailContacts?: MonitorSettingsEmail[] | [];
	phoneContacts?: StateMonitorSettingsSMS[] | [];
}
export interface ResendVerificationCodeParams {
	type: 'email' | 'sms';
	value: string;
}
