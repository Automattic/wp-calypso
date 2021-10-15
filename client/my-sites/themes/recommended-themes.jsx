import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useBlockEditorSettingsQuery } from 'calypso/data/block-editor/use-block-editor-settings-query';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getRecommendedThemes } from 'calypso/state/themes/actions';
import {
	getRecommendedThemes as getRecommendedThemesSelector,
	areRecommendedThemesLoading,
} from 'calypso/state/themes/selectors';
import { ConnectedThemesSelection } from './themes-selection';

const RecommendedThemes = ( props ) => {
	const dispatch = useDispatch();
	const userLoggedIn = useSelector( ( state ) => isUserLoggedIn( state ) );
	const { siteId } = props;
	const { isLoading: isLoadingBlockEditorSettings, data } = useBlockEditorSettingsQuery(
		siteId,
		userLoggedIn
	);

	const isFSEEligible = data?.is_fse_eligible ?? false;
	const recommendedThemesFilter = isFSEEligible ? 'block-templates' : 'auto-loading-homepage';

	const customizedThemesList = useSelector( ( state ) =>
		getRecommendedThemesSelector( state, recommendedThemesFilter )
	);

	const areThemesLoading = useSelector( ( state ) =>
		areRecommendedThemesLoading( state, recommendedThemesFilter )
	);

	useEffect( () => {
		if ( ! isLoadingBlockEditorSettings ) {
			dispatch( getRecommendedThemes( recommendedThemesFilter ) );
		}
	}, [ isLoadingBlockEditorSettings, recommendedThemesFilter, dispatch ] );

	return (
		<ConnectedThemesSelection
			{ ...props }
			isLoading={ isLoadingBlockEditorSettings || areThemesLoading }
			customizedThemesList={ customizedThemesList }
		/>
	);
};

export default RecommendedThemes;
