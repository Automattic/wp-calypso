/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import { trackClick } from './helpers';
import ThemesList from 'components/themes-list';
import wpcom from 'lib/wp';
import {
	// getPremiumThemePrice,
	// getThemesForQueryIgnoringPage,
	// getThemesFoundForQuery,
	// isRequestingThemesForQuery,
	// isThemesLastPageForQuery,
	isThemeActive,
	// isInstallingTheme,
} from 'state/themes/selectors';
import { setThemePreviewOptions } from 'state/themes/actions';

class RecommendedThemes extends React.Component {
	state = {
		themes: [],
	};

	async componentDidMount() {
		const query = {
			search: 'varia',
			number: 50,
			tier: 'free',
			filters: 'featured',
			apiVersion: '1.2',
		};
		const res = await wpcom.undocumented().themes( null, query );

		this.setState( { themes: res.themes } );
	}

	//intercept preview and add primary and secondary
	getOptions = themeId => {
		const options = this.props.getOptions( themeId );
		const wrappedPreviewAction = action => {
			let defaultOption;
			let secondaryOption = this.props.secondaryOption;
			return t => {
				if ( ! this.props.isLoggedIn ) {
					defaultOption = options.signup;
					secondaryOption = null;
				} else if ( this.props.isThemeActive( themeId ) ) {
					defaultOption = options.customize;
				} else if ( options.purchase ) {
					defaultOption = options.purchase;
				} else if ( options.upgradePlan ) {
					defaultOption = options.upgradePlan;
					secondaryOption = null;
				} else {
					defaultOption = options.activate;
				}
				this.props.setThemePreviewOptions( defaultOption, secondaryOption );
				return action( t );
			};
		};

		if ( options && options.preview ) {
			options.preview.action = wrappedPreviewAction( options.preview.action );
		}

		return options;
	};

	onScreenshotClick = ( themeId /* resultsRank */ ) => {
		trackClick( 'theme', 'screenshot' );
		// if ( ! this.props.isThemeActive( themeId ) ) {
		// 	this.recordSearchResultsClick( themeId, resultsRank, 'screenshot_info' );
		// }
		this.props.onScreenshotClick && this.props.onScreenshotClick( themeId );
	};

	render() {
		const { themes } = this.state;
		const { upselUrl } = this.props;

		return (
			<>
				<h1>We are the greatest Themes! Choose us...</h1>
				<ThemesList
					upselUrl={ upselUrl }
					themes={ themes }
					fetchNextPage={ () => null }
					onMoreButtonClick={ () => null }
					getButtonOptions={ this.getOptions }
					onScreenshotClick={ this.onScreenshotClick }
				/>
				<hr />
			</>
		);
	}
}

function bindIsThemeActive( state, siteId ) {
	return themeId => isThemeActive( state, themeId, siteId );
}

const ConnectedRecommendedThemes = connect(
	( state, { /*filter, page, search, tier, vertical, */ siteId /*source*/ } ) => {
		return {
			isThemeActive: bindIsThemeActive( state, siteId ),
		};
	},
	{ setThemePreviewOptions }
)( RecommendedThemes );

export default ConnectedRecommendedThemes;
