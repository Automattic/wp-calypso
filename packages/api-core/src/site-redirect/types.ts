export type SiteRedirect =
	| {
			location: string;
			enabled: boolean;
	  }
	| Record< string, never >;
