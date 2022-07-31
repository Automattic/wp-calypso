import { Component } from 'react';
import { connect } from 'react-redux';
import { getTrendingThemes } from 'calypso/state/themes/actions';
import {
	getTrendingThemes as getTrendingThemesSelector,
	areTrendingThemesLoading,
} from 'calypso/state/themes/selectors';
import { TrendingTheme, TrendingThemesFilter } from 'calypso/types';
import { ConnectedThemesSelection } from './themes-selection';

interface TrendingThemesProps {
	customizedThemesList: TrendingTheme[];
	filter: TrendingThemesFilter;
	getTrendingThemes: () => Promise< void >;
	isLoading: boolean;
	scrollToSearchInput: () => void;
}

class TrendingThemes extends Component< TrendingThemesProps > {
	componentDidMount() {
		if ( ! this.props.customizedThemesList.length ) {
			this.fetchThemes();
		}
	}

	componentDidUpdate( prevProps: TrendingThemesProps ) {
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
		this.props.getTrendingThemes();
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
