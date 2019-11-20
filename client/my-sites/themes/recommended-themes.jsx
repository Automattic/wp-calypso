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
		this.props.getRecommendedThemes();
	}

	render() {
		return (
			<>
				<h1>{ translate( 'Recommended Themes:' ) }</h1>
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
