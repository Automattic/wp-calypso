const INVALID_POST_BY_EMAIL_VALUES = new Set( [
	'',
	'null',
	'noop',
	'create',
	'regenerate',
	'delete',
] );

export function getAgentEmailAddress( postByEmailAddress?: string | null ) {
	const trimmedAddress = postByEmailAddress?.trim() ?? '';
	const normalizedAddress = trimmedAddress.toLowerCase();

	if ( INVALID_POST_BY_EMAIL_VALUES.has( normalizedAddress ) ) {
		return null;
	}

	const [ localPart, domain, ...extraParts ] = trimmedAddress.split( '@' );

	if ( ! localPart || ! domain || extraParts.length > 0 ) {
		return null;
	}

	const agentLocalPart = localPart.startsWith( 'agent+' ) ? localPart : `agent+${ localPart }`;

	return `${ agentLocalPart }@${ domain }`;
}

function escapeVCardValue( value: string ) {
	return value
		.replace( /\\/g, '\\\\' )
		.replace( /\r\n|\r|\n/g, '\\n' )
		.replace( /,/g, '\\,' )
		.replace( /;/g, '\\;' );
}

export function getAgentEmailVCard( siteDomain: string, agentEmailAddress: string ) {
	const escapedSiteDomain = escapeVCardValue( siteDomain );
	const escapedAgentEmailAddress = escapeVCardValue( agentEmailAddress );

	return [
		'BEGIN:VCARD',
		'VERSION:3.0',
		`FN:${ escapedSiteDomain }`,
		`N:${ escapedSiteDomain };;;;`,
		`EMAIL;TYPE=INTERNET:${ escapedAgentEmailAddress }`,
		'END:VCARD',
		'',
	].join( '\r\n' );
}

export function getAgentEmailVCardDataUrl( siteDomain: string, agentEmailAddress: string ) {
	return `data:text/vcard;charset=utf-8,${ encodeURIComponent(
		getAgentEmailVCard( siteDomain, agentEmailAddress )
	) }`;
}

export function getAgentEmailVCardFileName( siteDomain: string ) {
	const fileName = siteDomain.replace( /[^a-z0-9.-]+/gi, '-' ).replace( /^-+|-+$/g, '' );

	return `${ fileName || 'ai-agent' }.vcf`;
}
