import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRecommendedThemes } from 'calypso/state/themes/actions';
import {
	getRecommendedThemes as getRecommendedThemesSelector,
	areRecommendedThemesLoading,
} from 'calypso/state/themes/selectors';
import { ConnectedThemesSelection } from './themes-selection';

const RecommendedThemes = ( props ) => {
	const dispatch = useDispatch();

	const recommendedThemesFilter = 'full-site-editing';

	const customizedThemesList = useSelector( ( state ) =>
		getRecommendedThemesSelector( state, recommendedThemesFilter )
	);

	const areThemesLoading = useSelector( ( state ) =>
		areRecommendedThemesLoading( state, recommendedThemesFilter )
	);

	useEffect( () => {
		dispatch( getRecommendedThemes( recommendedThemesFilter ) );
	}, [ recommendedThemesFilter, dispatch ] );

	return (
		<ConnectedThemesSelection
			{ ...props }
			isLoading={ areThemesLoading }
			customizedThemesList={ customizedThemesList }
		/>
	);
};

export default RecommendedThemes;
