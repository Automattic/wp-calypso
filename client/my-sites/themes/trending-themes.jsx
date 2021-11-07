import { Component } from 'react';
import { connect } from 'react-redux';
import { getTrendingThemes } from 'calypso/state/themes/actions';
import {
	getTrendingThemes as getTrendingThemesSelector,
	areTrendingThemesLoading,
} from 'calypso/state/themes/selectors';
import { ConnectedThemesSelection } from './themes-selection';

class TrendingThemes extends Component {
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
		this.props.getTrendingThemes( this.props.filter );
	}

	render() {
		return <ConnectedThemesSelection { ...this.props } />;
	}
}

const ConnectedTrendingThemes = connect(
	( state ) => {
		return {
			customizedThemesList: getTrendingThemesSelector( state ),
			isLoading: areTrendingThemesLoading( state ),
		};
	},
	{ getTrendingThemes }
)( TrendingThemes );

export default ConnectedTrendingThemes;
