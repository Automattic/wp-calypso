import { createHigherOrderComponent } from '@wordpress/compose';
import { useSiteGlobalStylesOnPersonal } from 'calypso/state/sites/hooks/use-site-global-styles-on-personal';

export const withSiteGlobalStylesOnPersonal = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const isGlobalStylesOnPersonal = useSiteGlobalStylesOnPersonal();

		return <Wrapped { ...props } isGlobalStylesOnPersonal={ isGlobalStylesOnPersonal } />;
	},
	'withSiteGlobalStylesOnPersonal'
);
