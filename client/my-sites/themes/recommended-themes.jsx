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
import {
	getRecommendedThemes as getRecommendedThemesSelector,
	areRecommendedThemesLoading,
} from 'state/themes/selectors';

class RecommendedThemes extends React.Component {
	componentDidMount() {
		if ( ! this.props.recommendedThemes.length ) {
			this.props.getRecommendedThemes();
		}
	}

	componentDidUpdate( prevProps ) {
		// Wait until rec themes to be loaded to scroll to search input if its in use.
		const { isLoading, isShowcaseOpen, scrollToSearchInput } = this.props;
		if ( prevProps.isLoading !== isLoading && isLoading === false && isShowcaseOpen ) {
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
	( state ) => {
		return {
			recommendedThemes: getRecommendedThemesSelector( state ),
			isLoading: areRecommendedThemesLoading( state ),
		};
	},
	{ getRecommendedThemes }
)( RecommendedThemes );

export default ConnectedRecommendedThemes;
