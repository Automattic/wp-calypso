/**
 * External dependencies
 */
import React from 'react';
import { useQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { ConnectedThemesSelection } from './themes-selection';

const FseThemes = ( props ) => {
	// useQuery also provides 'error', currently unused here
	const { data, isLoading } = useQuery(
		'fse-themes',
		() =>
			wpcom.req.get( '/themes', {
				filter: 'block-templates',
				number: 50,
				tier: '',
				apiVersion: '1.2',
			} ),
		{}
	);
	return (
		<ConnectedThemesSelection
			isLoading={ isLoading }
			customizedThemesList={ data?.themes ?? [] }
			{ ...props }
		/>
	);
};
export default FseThemes;
