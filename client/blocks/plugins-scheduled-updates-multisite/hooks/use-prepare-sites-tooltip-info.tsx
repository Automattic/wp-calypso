import { createInterpolateElement } from '@wordpress/element';
import type { SiteDetails } from '@automattic/data-stores';

export function usePrepareSitesTooltipInfo() {
	const prepareSitesTooltipInfo = ( sites: SiteDetails[] ) => {
		const siteList = sites.map( ( site: SiteDetails ) => site.title ).join( '<br/>' );

		return createInterpolateElement< '<div><br/></div>' >(
			`<div>${ siteList }</div>` as '<div><br/></div>',
			{
				div: <div className="tooltip--selected-plugins" />,
				br: <br />,
			}
		);
	};

	return {
		prepareSitesTooltipInfo,
	};
}
