export interface JetpackModule {
	activated: boolean;
	available: boolean;
	name: string;
	requires_connection: boolean;
	[ key: string ]: unknown;
}
