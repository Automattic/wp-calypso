export interface WhoisDataEntry {
	fname: string;
	lname: string;
	org: string;
	email: string;
	sa1: string;
	sa2: string;
	city: string;
	sp: string;
	pc: string;
	cc: string;
	phone: string;
	fax: string;
}

export interface WhoisEmailRecord {
	type: string;
	forwards: string[] | null;
	mx_servers: string[] | null;
	max_forwards: number | null;
}

export interface WhoisPrivacy {
	private: boolean;
	available: boolean;
}

export interface WhoisDnsRecord {
	id: string;
	name: string;
	type: string;
	domain: string;
	protected_field: boolean;
}

export interface WhoisData {
	type: 'registration' | 'redirect' | 'mapping';
	verified: boolean;
	locked: boolean;
	maybe_pending_transfer: boolean;
	nameservers: string[];
	whois: WhoisDataEntry;
	email: WhoisEmailRecord;
	privacy: false | WhoisPrivacy;
	dns: { records: WhoisDnsRecord[] };
	sitename: string;
}
