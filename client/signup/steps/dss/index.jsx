/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import ThemeThumbnail from './theme-thumbnail';
import FormLabel from 'components/forms/form-label';
import SearchCard from 'components/search-card';
import StepWrapper from 'signup/step-wrapper';
import ThemeHelper from 'lib/themes/helpers';
import DynamicScreenshotsActions from 'lib/dss/actions';
import DSSImageStore from 'lib/dss/image-store';

const debug = debugFactory( 'calypso:dss' );

export default React.createClass( {
	displayName: 'DssThemeSelection',

	getDefaultProps() {
		return {
			themes: [
				'Boardwalk',
				'Cubic',
				'Edin',
				'Cols',
				'Minnow',
				'Sequential',
				'Penscratch',
				'Intergalactic',
				'Eighties'
			],

			useHeadstart: false
		};
	},

	handleSearch( searchString ) {
		debug( 'processing search for', searchString );
		if ( ! searchString ) {
			return DynamicScreenshotsActions.resetScreenshots();
		}
		const { imageResultsByKey } = DSSImageStore.get();
		if ( imageResultsByKey[ searchString ] ) {
			return DynamicScreenshotsActions.updateScreenshotsFor( searchString );
		}
		DynamicScreenshotsActions.fetchDSSImageFor( searchString );
	},

	renderContent() {
		return (
			<div>
				<div className="dss-theme-selection__search">
					<FormLabel htmlFor="dss-theme-selection__search__field">{ this.translate( 'Describe your site\'s focus in a word or two:' ) }</FormLabel>
					<SearchCard id="dss-theme-selection__search__field"
						autoFocus={ true }
						delaySearch={ true }
						placeholder={ this.translate( 'e.g., games' ) }
						onSearch={ this.handleSearch }
					/>
				</div>
				<div className="dss-theme-selection__screenshots">
					<div className="dss-theme-selection__screenshots__pin">
						<div className="dss-theme-selection__screenshots__themes">
							{ this.props.themes.map( ( theme ) => {
								return <ThemeThumbnail
									key={ theme }
									themeName={ theme }
									themeSlug={ ThemeHelper.getSlugFromName( theme ) }
									themeRepoSlug={ 'pub/' + ThemeHelper.getSlugFromName( theme ) }
									{ ...this.props }/>;
							} ) }
						</div>
					</div>
				</div>
				<p className="dss-theme-selection__credit">
					{ this.translate( 'This service uses the Flickr API but is not endorsed or certified by Flickr.{{br/}}All images are licensed {{a}}CC-BY-2.0{{/a}}.', {
						components: {
							br: <br />,
							a: <a href="https://creativecommons.org/licenses/by/2.0/" />
						}
					} ) }
				</p>
			</div>
		);
	},

	render() {
		const defaultDependencies = this.props.useHeadstart ? { theme: 'pub/twentyfifteen', images: null } : undefined;

		return (
			<StepWrapper
				fallbackHeaderText={ this.translate( 'Let\'s find the right design for you.' ) }
				fallbackSubHeaderText={ this.translate( 'Choose a design. You can always switch to one of our 300+ other designs later.' ) }
				headerText={ this.translate( 'Let\'s find the right design for you.' ) }
				subHeaderText={ this.translate( 'Choose a design. You can always switch to one of our 300+ other designs later.' ) }
				stepContent={ this.renderContent() }
				defaultDependencies={ defaultDependencies }
				{ ...this.props } />
		);
	}
} );
