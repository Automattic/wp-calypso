import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInterval } from 'calypso/lib/interval';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getAllPlugins } from 'calypso/state/plugins/wporg/selectors';

const PLUGIN_RETRIEVE_INTERVAL = 500;
const BATCH_PLUGIN_RETRIEVE_COUNT = 5;

function QueryDotorgPlugins( { pluginSlugList } ) {
	const dispatch = useDispatch();
	const queueRef = useRef( [] );

	const dotorgPlugins = useSelector( ( state ) => getAllPlugins( state ) );

	useEffect( () => {
		pluginSlugList.forEach( ( pluginSlug ) => {
			if ( ! queueRef.current.includes( pluginSlug ) && ! dotorgPlugins[ pluginSlug ] ) {
				queueRef.current.push( pluginSlug );
			}
		} );
	}, [ pluginSlugList, dotorgPlugins ] );

	useInterval( async () => {
		if ( pluginSlugList.length ) {
			const batch = queueRef.current.splice( 0, BATCH_PLUGIN_RETRIEVE_COUNT );

			await Promise.all(
				batch.map( ( pluginSlug ) => dispatch( wporgFetchPluginData( pluginSlug ) ) )
			);
		}
	}, PLUGIN_RETRIEVE_INTERVAL );

	return null;
}

QueryDotorgPlugins.propTypes = {
	pluginSlugList: PropTypes.array.isRequired,
};

export default QueryDotorgPlugins;
