/**
 * External dependencies
 */
import React from 'react';
import { useQuery } from 'react-query';
/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

const ThemeData = React.createContext();
export const ThemeDataProvider = ( { children } ) => {
	const useThemeQuery = ( select ) =>
		useQuery(
			'all-themes',
			() =>
				wpcom.req.get( '/themes', {
					number: 500,
					tier: '',
					apiVersion: '1.1', // 1.2 Hides FSE themes and does not include trending information
				} ),
			{ select }
		);

	const recommendedThemes = useThemeQuery( ( data ) =>
		Object.values( data.themes )
			.filter(
				( x ) =>
					x.taxonomies?.features.some( ( feature ) => feature.slug === 'recommended' ) &&
					x.taxonomies?.features.every( ( feature ) => feature.slug !== 'block-templates' )
			)
			.sort( ( a, b ) => new Date( b.date_launched ) - new Date( a.date_launched ) )
	);

	const fseThemes = useThemeQuery( ( data ) =>
		Object.values( data.themes )
			.filter( ( x ) =>
				x.taxonomies?.features.some( ( feature ) => feature.slug === 'block-templates' )
			)
			.sort( ( a, b ) => new Date( b.date_launched ) - new Date( a.date_launched ) )
	);

	const trendingThemes = useThemeQuery( ( data ) =>
		Object.values( data.themes )
			.sort( ( a, b ) => a.rank_trending - b.rank_trending )
			.slice( 0, 30 )
	);

	const themeData = {
		recommendedThemes,
		fseThemes,
		trendingThemes,
	};
	return <ThemeData.Provider value={ themeData }>{ children }</ThemeData.Provider>;
};
export const useThemeData = () => React.useContext( ThemeData );
