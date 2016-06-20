/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import i18n from 'i18n-calypso';
import SectionHeader from 'components/section-header';
import { getThemeDetailsUrl } from 'state/themes/themes/selectors';

const ThemesRelatedCard = React.createClass( {

	propTypes: {
		currentTheme: React.PropTypes.string.isRequired
	},

	getRelatedThemes() {
		let themes = new Set( [
			'twentysixteen',
			'rowling',
			'hemingway-rewritten',
			'gazette',
			'ecto',
			'isola',
			'edin',
			'sela',
			'pique',
			'harmonic'
		] );

		//Remove current theme so we will not show it as related
		themes.delete( this.props.currentTheme );
		themes = [ ...themes ];

		let randomThemeIndex = this.props.currentTheme.charCodeAt( 0 ) % themes.length;
		let theme = themes.splice( randomThemeIndex, 1 )[ 0 ];
		const selectedThemes = [ theme ];
		selectedThemes.push( themes[ theme.charCodeAt( 0 ) % themes.length ] );

		return selectedThemes;
	},

	render() {
		const themes = this.getRelatedThemes().map( slug => ( {
			id: slug,
			screenshot: `https://i1.wp.com/s0.wp.com/wp-content/themes/pub/${ slug }/screenshot.png`
		} ) );

		return (
			<div>
				<SectionHeader label={ i18n.translate( 'You might also like' ) } />
				<ul className="themes__sheet-related-themes">
					{ themes.map( theme => (
						<li key={ theme.id }>
							<Card className="themes__sheet-related-themes-card">
								<a href={ this.props.getDetailsUrl( theme ) }>
									<img src={ theme.screenshot + '?w=' + '660' }/>
								</a>
							</Card>
						</li>
					) ) }
				</ul>
			</div>
		);
	}
} );

export default connect(
	state => ( {
		getDetailsUrl: getThemeDetailsUrl.bind( null, state )
	} )
)( ThemesRelatedCard );
