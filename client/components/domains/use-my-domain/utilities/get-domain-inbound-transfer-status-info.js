import wpcom from 'calypso/lib/wp';

export async function getDomainInboundTransferStatusInfo( domainName ) {
	const inboundTransferStatusResult = await wpcom.req.get( {
		path: `/domains/${ encodeURIComponent( domainName ) }/inbound-transfer-status`,
	} );

	return {
		creationDate: inboundTransferStatusResult.creation_date,
		email: inboundTransferStatusResult.admin_email,
		inRedemption: inboundTransferStatusResult.in_redemption,
		losingRegistrar: inboundTransferStatusResult.registrar,
		losingRegistrarIanaId: inboundTransferStatusResult.registrar_iana_id,
		privacy: inboundTransferStatusResult.privacy,
		termMaximumInYears: inboundTransferStatusResult.term_maximum_in_years,
		transferEligibleDate: inboundTransferStatusResult.transfer_eligible_date,
		transferRestrictionStatus: inboundTransferStatusResult.transfer_restriction_status,
		unlocked: inboundTransferStatusResult.unlocked,
	};
}
