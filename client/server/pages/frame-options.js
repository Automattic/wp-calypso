// Pages are not framable outside Calypso's own origin, except that a development
// server lets a local tool (the site-builder cockpit) frame the build-wow
// generation screen to show it beside its own.
const LOCAL_FRAMEABLE_PATHS = [ '/setup/ai-site-builder-spec/site-generation' ];

const LOCAL_FRAME_ANCESTORS =
	"frame-ancestors 'self' http://localhost:* http://127.0.0.1:* http://*.localhost:*";

// Both the config environment and the build mode must be development, so a
// deployed container needs two settings wrong, not one, to be framable.
export function getFrameHeaders( { env, nodeEnv, path } ) {
	if (
		env === 'development' &&
		nodeEnv === 'development' &&
		LOCAL_FRAMEABLE_PATHS.includes( path )
	) {
		return { 'Content-Security-Policy': LOCAL_FRAME_ANCESTORS };
	}

	return { 'X-Frame-Options': 'SAMEORIGIN' };
}
