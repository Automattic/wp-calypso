export const SESSION_STORAGE_MIGRATION_STATUS = 'migration_status';

export const storeMigrationStatus = ( status ) => {
	window.sessionStorage.setItem( SESSION_STORAGE_MIGRATION_STATUS, status );
};

export const clearMigrationStatus = () => {
	window.sessionStorage.removeItem( SESSION_STORAGE_MIGRATION_STATUS );
};

export const retrieveMigrationStatus = () => {
	return window.sessionStorage.getItem( SESSION_STORAGE_MIGRATION_STATUS );
};
