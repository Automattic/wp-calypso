/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'calypso/state/data-layer/http-data';

const requestSiteAlerts = ( siteId ) => {
	const id = `site-alerts-${ siteId }`;

	return requestHttpData(
		id,
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/alerts`,
				apiNamespace: 'wpcom/v2',
			},
			{}
		),
		{
			freshness: 5 * 60 * 1000,
			fromApi: () => ( { suggestions, threats, warnings, updates } ) => [
				[
					id,
					{
						suggestions,
						threats: threats.map( ( threat ) => ( {
							id: threat.id,
							signature: threat.signature,
							description: threat.description,
							firstDetected: Date.parse( threat.first_detected ),
							...( threat.context ? { filename: threat.filename, context: threat.context } : {} ),
							...( threat.diff ? { filename: threat.filename, diff: threat.diff } : {} ),
							...( threat.extension
								? {
										extension: {
											type: threat.extension.type,
											name: threat.extension.name,
											slug: threat.extension.slug,
											version: threat.extension.version,
										},
								  }
								: {} ),
						} ) ),
						warnings,
						updates: {
							themes: updates.themes.map( ( theme ) => ( {
								name: theme.name,
								slug: theme.slug,
								type: theme.type,
								version: theme.version,
							} ) ),
							core: updates.core.map( ( theme ) => ( {
								name: theme.name,
								slug: theme.slug,
								type: theme.type,
								version: theme.version,
							} ) ),
						},
					},
				],
			],
		}
	);
};

export default requestSiteAlerts;
