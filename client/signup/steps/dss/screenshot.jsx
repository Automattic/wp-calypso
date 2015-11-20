/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import DynamicScreenshotsActions from 'lib/dss/actions';
import ThemePreviewStore from 'lib/dss/preview-store';
import DSSImageStore from 'lib/dss/image-store';

const debug = debugFactory( 'calypso:dss:screenshot' );

function replaceMarkupWithImage( markup, imageUrl ) {
	return markup.replace( /(<img [^>]+)src=['"][^'"]+['"]([^>]*>)/g, ( ...imgMatches ) => {
		if ( imgMatches.length < 3 ) {
			return imgMatches[0];
		}
		const [ original, start, end ] = imgMatches;
		if ( ! ( start + end ).match( /wp-post-image/ ) ) {
			return original;
		}
		return `${start}src="${imageUrl}"${end}`;
	} );
}

export default React.createClass( {
	displayName: 'DssScreenshot',

	propTypes: {
		screenshotUrl: React.PropTypes.string.isRequired,
		themeRepoSlug: React.PropTypes.string.isRequired,
		themeSlug: React.PropTypes.string.isRequired
	},

	getInitialState() {
		return {
			isLoading: false,
			markup: '',
			styles: '',
			renderComplete: false,
			dssImage: null
		};
	},

	componentWillMount() {
		ThemePreviewStore.on( 'change', this.updateScreenshot );
		DSSImageStore.on( 'change', this.updateScreenshot );
		DynamicScreenshotsActions.fetchThemePreview( this.props.themeRepoSlug );
	},

	componentWillUnmount() {
		ThemePreviewStore.off( 'change', this.updateScreenshot );
		DSSImageStore.off( 'change', this.updateScreenshot );
	},

	getAdditionalStyles( imageUrl ) {
		return `#theme-${this.props.themeSlug} .hero.with-featured-image{background-image:url(${imageUrl});}`;
	},

	getMarkupAndStyles() {
		if ( ! this.state.markup || ! this.state.styles ) {
			return ThemePreviewStore.get()[ this.props.themeRepoSlug ] || { markup: null, styles: null };
		}
		return { markup: this.state.markup, styles: this.state.styles };
	},

	updateScreenshot() {
		const { isLoading, lastKey, imageResultsByKey } = DSSImageStore.get();
		if ( ! imageResultsByKey[ lastKey ] ) {
			return this.setState( Object.assign( {}, this.getInitialState(), { isLoading } ) );
		}
		const dssImage = imageResultsByKey[ lastKey ];
		debug( 'replacing images in ' + this.props.themeRepoSlug + ' screenshot with', dssImage.url );
		const { markup, styles } = this.getMarkupAndStyles();
		// Give styles time to render. Note this only happens on first markup
		// render. Subsequent changes don't flicker unstyled markup.
		setTimeout( () => this.setState( { renderComplete: true } ), 250 );
		return this.setState( { dssImage, markup, styles, isLoading } );
	},

	render() {
		const containerClassNames = classnames( 'dss-screenshot', {
			'is-loading': this.state.isLoading,
			'is-preview-ready': this.state.markup && this.state.styles && this.state.renderComplete
		} );

		if ( this.state.markup && this.state.styles ) {
			return (
				<div className={ containerClassNames }>
					<div className="dss-screenshot__original">
						<img src={ this.props.screenshotUrl } alt={ this.translate( 'Loading...' ) } />
					</div>
					<div className="dss-screenshot__dynamic">
						<style dangerouslySetInnerHTML={{ __html: this.state.styles }} />
						<style dangerouslySetInnerHTML={{ __html: this.state.dssImage ? this.getAdditionalStyles( this.state.dssImage.url ) : '' }} />
						<div className="dss-screenshot__markup" dangerouslySetInnerHTML={{ __html: this.state.dssImage ? replaceMarkupWithImage( this.state.markup, this.state.dssImage.url ) : this.state.markup }} />
					</div>
				</div>
			);
		}

		// Show the actual screenshot as a fallback while loading or if markup is not found
		return (
			<div className={ containerClassNames }>
				<div className="dss-screenshot__original">
					<img src={ this.props.screenshotUrl } alt={ this.translate( 'Loading...' ) } />
				</div>
			</div>
		);
	}

} );
