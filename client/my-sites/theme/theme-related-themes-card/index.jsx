/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import i18n from 'lib/mixins/i18n';
import SectionHeader from 'components/section-header';
import { getDetailsUrl } from 'my-sites/themes/helpers';

var ThemeRelatedThemesCard = React.createClass( {

	propTypes: {
		currentTheme: React.PropTypes.string.isRequired
	},

	getRelatedThemes() {
		var themes = [
			{ name: 'Twenty Sixteen', slug: 'twentysixteen' },
			{ name: 'Rowling', slug: 'rowling' },
			{ name: 'Hemingway Rewritten', slug: 'hemingway-rewritten' },
			{ name: 'Gazette', slug: 'gazette' },
			{ name: 'Ecto', slug: 'ecto' },
			{ name: 'Isola', slug: 'isola' },
			{ name: 'Edin', slug: 'edin' },
			{ name: 'Sela', slug: 'sela' },
			{ name: 'Pique', slug: 'pique' },
			{ name: 'Harmonic', slug: 'harmonic' },
		];

		var selectedThemes = [];

		while( selectedThemes.length < 2 ) {
			let randomThemeIndex = Math.floor(Math.random() * themes.length );
			let theme = themes.splice( randomThemeIndex, 1 )[0];
			// Check if it is not current theme, if it is than discard
			if ( this.props.currentTheme === theme.slug ) {
				continue;
			} else {
				selectedThemes.push( theme );
			}
		}

		return selectedThemes;
	},

	render() {
		var themes = this.getRelatedThemes().map( theme => ( {
				id: theme.slug,
				screenshot: 'https://i1.wp.com/s0.wp.com/wp-content/themes/pub/' + theme.slug + '/screenshot.png'
		} ) );

		const related_text = i18n.translate( 'See all {{a}}BUSINESS{{/a}} themes.', {
			components: {
				a: <a href="/design?s=business"/>
			}
		} );

		return (
			<div>
				<SectionHeader label={ i18n.translate( 'You might also like' ) } />
				<ul className="themes__sheet-related-themes">
					{ themes.map( theme => (
						<li key={ theme.id }>
							<Card className="themes__sheet-related-themes-card">
								<a href={ getDetailsUrl( theme ) }>
									<img src={ theme.screenshot + '?w=' + '660' }/>
								</a>
							</Card>
						</li>
					) ) }
				</ul>
				<div className="themes__sheet-related-themes-link">
					<p>{ related_text }</p>
				</div>
			</div>
		);
	}
} );

module.exports = ThemeRelatedThemesCard;
