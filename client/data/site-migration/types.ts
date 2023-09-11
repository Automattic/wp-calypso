export interface MigrationEnabledResponse {
	source_blog_id: number;
	jetpack_activated: boolean;
	jetpack_compatible: boolean;
	migration_activated: boolean;
	migration_compatible: boolean;
	can_migrate: boolean;
}
