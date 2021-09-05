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
	componentDidMount() {
		if ( ! this.props.customizedThemesList.length ) {
			this.fetchThemes();
		}
	}

	componentDidUpdate( prevProps ) {
		// Wait until rec themes to be loaded to scroll to search input if its in use.
		const { isLoading, scrollToSearchInput, filter } = this.props;
		if ( prevProps.isLoading !== isLoading && isLoading === false ) {
			scrollToSearchInput();
		}
		if ( prevProps.filter !== filter ) {
			this.fetchThemes();
		}
	}

	fetchThemes() {
		this.props.getRecommendedThemes( this.props.filter );
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
			customizedThemesList: getRecommendedThemesSelector( state, filter ),
			isLoading: areRecommendedThemesLoading( state, filter ),
			filter,
		};
	},
	{ getRecommendedThemes }
)( RecommendedThemes );

export default ConnectedRecommendedThemes;
