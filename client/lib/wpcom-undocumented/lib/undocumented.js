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

/**
 * Look for a site belonging to the currently logged in user that matches the
 * anchor parameters specified.
 *
 * @param anchorFmPodcastId {string | null}  Example: 22b6608
 * @param anchorFmEpisodeId {string | null}  Example: e324a06c-3148-43a4-85d8-34c0d8222138
 * @param anchorFmSpotifyUrl {string | null} Example: https%3A%2F%2Fopen.spotify.com%2Fshow%2F6HTZdaDHjqXKDE4acYffoD%3Fsi%3DEVfDYETjQCu7pasVG5D73Q
 * @param anchorFmSite {string | null} Example: 181129564
 * @param anchorFmPost {string | null} Example: 5
 * @returns {Promise} A promise
 *    The promise should resolve to a json object containing ".location" key as {string|false} type.
 *    False - There were no matching sites detected, the user should create a new one.
 *    String - The URL to redirect the user to, to edit a new or existing post on that site.
 */
Undocumented.prototype.getMatchingAnchorSite = function (
	anchorFmPodcastId,
	anchorFmEpisodeId,
	anchorFmSpotifyUrl,
	anchorFmSite,
	anchorFmPost
) {
	const queryParts = {
		podcast: anchorFmPodcastId,
		episode: anchorFmEpisodeId,
		spotify_url: anchorFmSpotifyUrl,
		site: anchorFmSite,
		post: anchorFmPost,
	};
	Object.keys( queryParts ).forEach( ( k ) => {
		if ( queryParts[ k ] === null ) {
			delete queryParts[ k ];
		}
	} );
	return this.wpcom.req.get(
		{
			path: '/anchor',
			method: 'GET',
			apiNamespace: 'wpcom/v2',
		},
		queryParts
	);
};

export default Undocumented;
