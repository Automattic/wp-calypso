export interface ContactVerificationTldConfig {
	registryName: string;
	registryDescription: string;
	acceptedDocuments: string[];
}

const contactVerificationTldConfig: Record< string, ContactVerificationTldConfig > = {
	uk: {
		registryName: 'Nominet',
		registryDescription:
			'Nominet, the organization that manages .uk domains, requires us to verify the contact information of your domain.',
		acceptedDocuments: [
			"Valid drivers' license",
			'Valid national ID cards (for non-UK residents)',
			'Utility bills (last 3 months)',
			'Bank statement (last 3 months)',
			'HMRC tax notification (last 3 months)',
		],
	},
	in: {
		registryName: 'NIXI',
		registryDescription:
			'NIXI, the organization that manages .in domains, requires us to verify the contact information of your domain.',
		acceptedDocuments: [],
	},
};

const defaultConfig: ContactVerificationTldConfig = {
	registryName: '',
	registryDescription: 'The registry requires us to verify the contact information of your domain.',
	acceptedDocuments: [],
};

export function getContactVerificationTldConfig( tld: string ): ContactVerificationTldConfig {
	return contactVerificationTldConfig[ tld ] ?? defaultConfig;
}

export function extractTld( domainName: string ): string {
	const parts = domainName.split( '.' );
	return parts[ parts.length - 1 ] ?? '';
}
