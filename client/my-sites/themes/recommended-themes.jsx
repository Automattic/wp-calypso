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
		const filters = getRecommendedThemesFilter( state, siteId );
		return {
			customizedThemesList: getRecommendedThemesSelector( state, siteId ),
			isLoading: areRecommendedThemesLoading( state, filters, siteId ),
			filters,
		};
	},
	{ getRecommendedThemes }
)( RecommendedThemes );

export default ConnectedRecommendedThemes;
