/**
 * Internal dependencies
 */
import { fetchAndParse } from '../wpcom-request-controls';
import { importableSite, receiveImportableSite, receiveImportableSiteFailed } from './actions';

export function* validateSiteIsImportable( siteUrl: string ) {
	yield importableSite();
	try {
		const { ok, body: siteImportable } = yield fetchAndParse(
			`https://public-api.wordpress.com/wpcom/v2/imports/is-site-importable?site_url=${ encodeURIComponent(
				siteUrl
			) }`,
			{
				mode: 'cors',
				credentials: 'omit',
			}
		);

		if ( ! ok ) {
			throw siteImportable;
		}

		yield receiveImportableSite( siteImportable );
		return { ok } as const;
	} catch ( siteImportableError ) {
		yield receiveImportableSiteFailed( siteImportableError );

		return { ok: false, siteImportableError } as const;
	}
}
