/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import { ConnectedThemesSelection } from './themes-selection';
import { useThemeData } from './theme-data-context';

const TrendingThemes = localize( ( { translate, ...restProps } ) => {
	const {
		recommendedThemes: { data, error, isLoading },
	} = useThemeData();
	if ( error ) {
		return <EmptyContent title={ translate( 'Sorry, no themes found.' ) } />;
	}
	return (
		<ConnectedThemesSelection
			isLoading={ isLoading }
			customizedThemesList={ data ?? [] }
			{ ...restProps }
		/>
	);
} );
export default TrendingThemes;
