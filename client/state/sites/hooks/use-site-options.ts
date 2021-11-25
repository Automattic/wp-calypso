import { snakeToCamelCase } from '@automattic/js-utils';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSiteOptions from '../selectors/get-site-options';

type SiteOptions = { [ key: string ]: any };

/**
 * Get the site options
 *
 * @param optionNames options you want to query
 * @returns {object} site options and the properties are listed in the given option names and converted to camel case
 */
const useSiteOptions = ( optionNames: string[] = [] ): SiteOptions => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteOptions: SiteOptions | null = useSelector( ( state ) =>
		getSiteOptions( state, selectedSiteId || 0 )
	);

	const result: SiteOptions = {};

	optionNames.forEach( ( optionName ) => {
		result[ snakeToCamelCase( optionName ) ] = siteOptions?.[ optionName ] ?? null;
	} );

	return result;
};

export default useSiteOptions;
