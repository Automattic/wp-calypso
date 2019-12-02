/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import { ConnectedThemesSelection } from './themes-selection';
import Spinner from 'components/spinner';
import { getRecommendedThemes } from 'state/themes/actions';

class RecommendedThemes extends React.Component {
	componentDidMount() {
		if ( ! this.props.recommendedThemes.length ) {
			this.props.getRecommendedThemes();
		}
	}

	componentDidUpdate( prevProps ) {
		const { isLoading, isQueried, scrollToSearchInput } = this.props;
		// When Recommended Themes load, trigger a scroll-to results if queried.
		if ( prevProps.isLoading !== isLoading && isLoading === false && isQueried ) {
			scrollToSearchInput();
		}
	}

	render() {
		return (
			<>
				<h2>
					<strong>{ translate( 'Recommended Themes' ) }</strong>
				</h2>
				{ this.props.isLoading ? (
					<Spinner size={ 100 } />
				) : (
					<ConnectedThemesSelection { ...this.props } />
				) }
			</>
		);
	}
}

const ConnectedRecommendedThemes = connect(
	state => {
		return {
			recommendedThemes: state.themes.recommendedThemes.themes || [],
			isLoading: state.themes.recommendedThemes.isLoading,
		};
	},
	{ getRecommendedThemes }
)( RecommendedThemes );

export default ConnectedRecommendedThemes;
