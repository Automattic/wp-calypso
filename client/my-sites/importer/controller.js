import page from '@automattic/calypso-router';
import { camelCase } from 'lodash';
import { BrowserRouter } from 'react-router-dom';
import CaptureScreen from 'calypso/blocks/import/capture';
import { decodeURIComponentIfValid } from 'calypso/lib/url';
import SectionImport from 'calypso/my-sites/importer/section-import';
import 'calypso/blocks/import/style/base.scss';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export function importSite( context, next ) {
	const state = context.store.getState();
	const engine = context.query?.engine;
	const fromSite = decodeURIComponentIfValid(
		context.query?.[ 'from-site' ] || context.query?.from
	);
	const siteSlug = getSelectedSiteSlug( state );

	const afterStartImport = () => {
		let path = context.pathname;

		if ( fromSite ) {
			path += '?from-site=' + fromSite;
		}
		page.replace( path );
	};

	switch ( context.query?.flow ) {
		case 'onboarding': {
			context.primary = (
				<BrowserRouter>
					<div className="import__onboarding-page">
						<CaptureScreen
							goToStep={ ( stepName, stepSectionName, params ) => {
								const route = [ 'import', stepName, stepSectionName ].join( '_' );
								const importerPath = `/setup/import-focused/${ camelCase(
									route
								) }?siteSlug=${ siteSlug }&from=${ encodeURIComponent( params?.fromUrl || '' ) }`;

								page( importerPath );
							} }
						/>
					</div>
				</BrowserRouter>
			);
			break;
		}
		default:
			context.primary = (
				<SectionImport
					engine={ engine }
					fromSite={ fromSite }
					afterStartImport={ afterStartImport }
				/>
			);
	}
	next();
}
