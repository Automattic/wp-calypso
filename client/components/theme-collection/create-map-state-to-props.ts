import { ThemesCollectionProps } from 'calypso/components/theme-collection/themes-collection-props';
import { getThemesForQueryIgnoringPage } from 'calypso/state/themes/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Create a mapStateToProps closure for theme collections based on a theme query object.
 * @param query
 */
export const createWpcomThemeCollectionMapStateToProps = ( query: object ) => {
	return ( state: IAppState, ownProps: ThemesCollectionProps ) => {
		const siteId = getSelectedSiteId( state ) as unknown as string;

		const themes = ( getThemesForQueryIgnoringPage( state, 'wpcom', query ) as never[] ) ?? []; // We should change it to a nullable value so that we can use LoadingPlaceholders.
		return {
			...ownProps,
			themes,
			siteId,
		};
	};
};
