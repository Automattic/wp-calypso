/**
 * Object map tracking messages which have been logged, for use in ensuring a
 * message is only logged once.
 *
 * @type {Object}
 */
export const logged = Object.create( null );

/**
 * Logs a message to notify developers about a deprecated feature.
 *
 * @param {string}  feature             Name of the deprecated feature.
 * @param {?Object} options             Personalisation options
 * @param {?string} options.version     Version in which the feature will be removed.
 * @param {?string} options.alternative Feature to use instead
 * @param {?string} options.plugin      Plugin name if it's a plugin feature
 * @param {?string} options.link        Link to documentation
 * @param {?string} options.hint        Additional message to help transition away from the deprecated feature.
 */
export default function deprecated( feature, { version, alternative, plugin, link, hint } = {} ) {
	const pluginMessage = plugin ? ` from ${ plugin }` : '';
	const versionMessage = version ? `${ pluginMessage } in ${ version }` : '';
	const useInsteadMessage = alternative ? ` Please use ${ alternative } instead.` : '';
	const linkMessage = link ? ` See: ${ link }` : '';
	const hintMessage = hint ? ` Note: ${ hint }` : '';
	const message = `${ feature } is deprecated and will be removed${ versionMessage }.${ useInsteadMessage }${ linkMessage }${ hintMessage }`;

	// Skip if already logged.
	if ( message in logged ) {
		return;
	}

	// eslint-disable-next-line no-console
	console.warn( message );

	logged[ message ] = true;
}
