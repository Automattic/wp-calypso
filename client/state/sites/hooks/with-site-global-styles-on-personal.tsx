import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { useSiteGlobalStylesOnPersonal } from 'calypso/state/sites/hooks/use-site-global-styles-on-personal';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const withSiteGlobalStylesOnPersonal = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const isGlobalStylesOnPersonal = useSiteGlobalStylesOnPersonal( siteId );

		return <Wrapped { ...props } isGlobalStylesOnPersonal={ isGlobalStylesOnPersonal } />;
	},
	'withSiteGlobalStylesOnPersonal'
);
