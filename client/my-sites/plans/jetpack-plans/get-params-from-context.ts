import { Duration } from './types';
import type { Context } from '@automattic/calypso-router';

type Params = {
	duration: Duration | undefined;
	site: string | undefined;
};

/**
 * Retrieves the values of the `duration` and `site` parameters passed in the
 * URL, in the context of the Jetpack plans/pricing page.
 * @example
 * /pricing                    > { duration: undefined, site: undefined }
 * /pricing/annual             > { duration: 'annual', site: undefined }
 * /pricing/monthly            > { duration: 'monthly', site: undefined }
 * /pricing/example.com        > { duration: undefined, site: 'example.com' }
 * /pricing/annual/example.com > { duration: 'annual', site: 'example.com' }
 * /pricing/weekly/example.com > { duration: undefined, site: 'example.com' }
 * @param {Context} context Page context
 * @returns {Params} Parameters
 */
export default function getParamsFromContext( context: Context ): Params {
	const { duration: rawDuration, site: rawSite } = context.params;
	const duration = [ 'annual', 'monthly' ].includes( rawDuration ) ? rawDuration : undefined;
	const site = ( rawSite || ( duration ? undefined : rawDuration ) ) ?? undefined;

	return {
		duration,
		site,
	};
}
