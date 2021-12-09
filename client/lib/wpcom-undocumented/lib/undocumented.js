/**
 * Create an `Undocumented` instance
 *
 * @param {object} wpcom - The request handler
 * @returns {Undocumented} - An instance of Undocumented
 */
function Undocumented( wpcom ) {
	if ( ! ( this instanceof Undocumented ) ) {
		return new Undocumented( wpcom );
	}
	this.wpcom = wpcom;
}

Undocumented.prototype.applyDnsTemplateSyncFlow = function (
	domain,
	provider,
	service,
	variables,
	callback
) {
	return this.wpcom.req.get(
		'/domain-connect/authorize/v2/domainTemplates/providers/' +
			provider +
			'/services/' +
			service +
			'/apply/authorized',
		Object.assign( {}, { apiVersion: '1.3' }, variables ),
		callback
	);
};

Undocumented.prototype.getDnsTemplateRecords = function (
	domain,
	provider,
	service,
	variables,
	callback
) {
	return this.wpcom.req.post(
		'/domains/' + domain + '/dns/providers/' + provider + '/services/' + service + '/preview',
		{ variables },
		callback
	);
};

Undocumented.prototype.getDomainConnectSyncUxUrl = function (
	domain,
	providerId,
	serviceId,
	redirectUri,
	callback
) {
	return this.wpcom.req.get(
		`/domains/${ domain }/dns/providers/${ providerId }/services/${ serviceId }/syncurl`,
		{ redirect_uri: redirectUri },
		callback
	);
};

Undocumented.prototype.domainsVerifyOutboundTransferConfirmation = function (
	domain,
	recipientId,
	token,
	command
) {
	return this.wpcom.req.get( `/domains/${ domain }/outbound-transfer-confirmation-check`, {
		recipient_id: recipientId,
		token,
		command,
	} );
};

export default Undocumented;
