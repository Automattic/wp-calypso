import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { getPluginsWithUpdates } from 'calypso/state/plugins/installed/selectors';
import { isJetpackSiteSecondaryNetworkSite } from 'calypso/state/sites/selectors';

const EMPTY_LIST = [];

const unionBySlug = ( a = [], b = [] ) => [
	...a,
	...b.filter( ( be ) => ! a.some( ( ae ) => ae.slug === be.slug ) ),
];

export default function ( WrappedComponent ) {
	function WithItemsToUpdate( { siteId, ...props } ) {
		const pluginsWithUpdates = useSelector( ( state ) => {
			if ( isJetpackSiteSecondaryNetworkSite( state, siteId ) ) {
				return EMPTY_LIST;
			}
			return getPluginsWithUpdates( state, [ siteId ] ) ?? EMPTY_LIST;
		} );

		// merge the `pluginsWithUpdates` object into the previous value, so that plugins that
		// have been updated are still part of the list and don't disappear.
		const plugins = useRef( { siteId: undefined, mergedPlugins: undefined } );
		const mergedPlugins =
			plugins.current.siteId === siteId
				? unionBySlug( pluginsWithUpdates, plugins.current.mergedPlugins )
				: pluginsWithUpdates;
		plugins.current = { siteId, mergedPlugins };

		const siteAlertsQuery = useQuery( {
			queryKey: [ 'site-alerts', siteId ],
			queryFn: () =>
				wpcom.req.get( { path: `/sites/${ siteId }/alerts`, apiNamespace: 'wpcom/v2' } ),
			staleTime: Infinity,
			refetchOnMount: 'always',
			refetchInterval: 5 * 60 * 1000,
		} );

		const themes = siteAlertsQuery.data?.updates?.themes ?? EMPTY_LIST;
		const core = siteAlertsQuery.data?.updates?.core ?? EMPTY_LIST;

		return (
			<WrappedComponent
				{ ...props }
				siteId={ siteId }
				plugins={ mergedPlugins }
				themes={ themes }
				core={ core }
			/>
		);
	}

	WithItemsToUpdate.propTypes = {
		siteId: PropTypes.number.isRequired,
	};

	return WithItemsToUpdate;
}
