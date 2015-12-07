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
import ThemePreviewStore from 'lib/dss/preview-store';
import ImagePreloader from 'components/image-preloader';

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

	getInitialState() {
		return {
			isLoading: false,
			renderComplete: false,
			markupAndStyles: {},
			dssImage: null
		};
	},

	componentWillMount() {
		ThemePreviewStore.on( 'change', this.updateMarkup );
		DSSImageStore.on( 'change', this.updateScreenshots );
		this.loadThemePreviews();
	},

	componentWillUnmount() {
		ThemePreviewStore.off( 'change', this.updateMarkup );
		DSSImageStore.off( 'change', this.updateScreenshots );
	},

	componentWillReceiveProps() {
		this.loadThemePreviews();
	},

	loadThemePreviews() {
		debug( 'loading theme previews for these themes', this.props.themes );
		this.props.themes.map( theme => DynamicScreenshotsActions.fetchThemePreview( 'pub/' + ThemeHelper.getSlugFromName( theme ) ) );
	},

	updateMarkup() {
		this.setState( { markupAndStyles: ThemePreviewStore.get() } );
	},

	updateScreenshots() {
		const { isLoading, lastKey, imageResultsByKey } = DSSImageStore.get();
		// If there is no search currently happening or no results for a current search...
		if ( ! imageResultsByKey[ lastKey ] ) {
			return this.setState( { isLoading, renderComplete: false, dssImage: null } );
		}
		const dssImage = imageResultsByKey[ lastKey ];
		this.setState( { isLoading, dssImage, renderComplete: false } );
	},

	dssImageLoaded() {
		debug( 'image preloading complete' );
		this.setState( { renderComplete: true } );
	},

	handleSearch( searchString ) {
		if ( ! searchString ) {
			return DynamicScreenshotsActions.resetScreenshots();
		}
		const normalizedSearchString = searchString.toLowerCase().trim();
		if ( normalizedSearchString.length < 3 ) {
			return;
		}
		debug( 'processing search for', normalizedSearchString );
		const { imageResultsByKey } = DSSImageStore.get();
		if ( imageResultsByKey[ normalizedSearchString ] ) {
			return DynamicScreenshotsActions.updateScreenshotsFor( normalizedSearchString );
		}
		DynamicScreenshotsActions.fetchDSSImageFor( normalizedSearchString );
	},

	renderImageLoader() {
		if ( this.state.renderComplete ) {
			return '';
		}
		debug( 'preloading image', this.state.dssImage.url );
		const placeholder = <div>…</div>;
		return (
			<ImagePreloader
				className="dss-theme-selection__image-preloader"
				onLoad={ this.dssImageLoaded }
				src={ this.state.dssImage.url }
				placeholder={ placeholder } />
		);
	},

	renderContent() {
		return (
			<div>
				<div className="dss-theme-selection__search">
					<FormLabel htmlFor="dss-theme-selection__search__field">{ this.translate( 'Describe your site\'s focus in a word or two:' ) }</FormLabel>
					<SearchCard id="dss-theme-selection__search__field"
						autoFocus={ true }
						delaySearch={ true }
						delayTimeout={ 450 }
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
									isLoading={ this.state.isLoading }
									dssImage={ this.state.dssImage }
									markupAndStyles={ this.state.markupAndStyles[ 'pub/' + ThemeHelper.getSlugFromName( theme ) ] }
									renderComplete={ this.state.renderComplete }
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
				{ this.state.dssImage ? this.renderImageLoader() : '' }
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
