import React from 'react';
import { connect } from 'react-redux';
import { getRecommendedThemes } from 'calypso/state/themes/actions';
import {
	getRecommendedThemes as getRecommendedThemesSelector,
	areRecommendedThemesLoading,
	getRecommendedThemesFilter,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { ConnectedThemesSelection } from './themes-selection';

class RecommendedThemes extends React.Component {
	componentDidUpdate( prevProps ) {
		// Wait until rec themes to be loaded to scroll to search input if its in use.
		const { isLoading, scrollToSearchInput } = this.props;
		if ( prevProps.isLoading !== isLoading && isLoading === false ) {
			scrollToSearchInput();
		}
	}

	render() {
		return <ConnectedThemesSelection { ...this.props } />;
	}
}

const ConnectedRecommendedThemes = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const filter = getRecommendedThemesFilter( state, siteId );
		return {
			customizedThemesList: getRecommendedThemesSelector( state, siteId ),
			// TODO: How do we accommodate isLoading?
			isLoading: areRecommendedThemesLoading( state, filter ),
			// TODO: Get rid of filter key
			filter,
			filters: filter,
		};
	},
	{ getRecommendedThemes }
)( RecommendedThemes );

export default ConnectedRecommendedThemes;
