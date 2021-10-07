import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGutenbergFSESettingsQuery } from 'calypso/data/gutenberg/fse-settings-query';
import { getRecommendedThemes } from 'calypso/state/themes/actions';
import {
	getRecommendedThemes as getRecommendedThemesSelector,
	areRecommendedThemesLoading,
} from 'calypso/state/themes/selectors';
import { ConnectedThemesSelection } from './themes-selection';

const RecommendedThemes = ( props ) => {
	const dispatch = useDispatch();
	const { siteId } = props;
	const { isLoading: isLoadingGutenbergFSESettings, data } = useGutenbergFSESettingsQuery( siteId );

	const isCoreFSEEligible = data?.is_core_fse_eligible ?? false;
	const recommendedThemesFilter = isCoreFSEEligible ? 'block-templates' : 'auto-loading-homepage';

	const customizedThemesList = useSelector( ( state ) =>
		getRecommendedThemesSelector( state, recommendedThemesFilter )
	);

	const areThemesLoading = useSelector( ( state ) =>
		areRecommendedThemesLoading( state, recommendedThemesFilter )
	);

	useEffect( () => {
		if ( ! isLoadingGutenbergFSESettings ) {
			dispatch( getRecommendedThemes( recommendedThemesFilter ) );
		}
	}, [ isLoadingGutenbergFSESettings, recommendedThemesFilter, dispatch ] );

	return (
		<ConnectedThemesSelection
			{ ...props }
			isLoading={ isLoadingGutenbergFSESettings || areThemesLoading }
			customizedThemesList={ customizedThemesList }
		/>
	);
};

export default RecommendedThemes;
