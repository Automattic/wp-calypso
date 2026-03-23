export interface WpOrgCoreVersionOffer {
	response: string;
	download: string;
	locale: string;
	packages: {
		full: string;
		no_content: string;
		new_bundled: string;
		partial: boolean;
		rollback: boolean;
	};
	current: string;
	version: string;
	php_version: string;
	mysql_version: string;
	new_bundled: string;
	partial_version: boolean;
}

export interface WpOrgCoreVersionCheck {
	offers: WpOrgCoreVersionOffer[];
}
