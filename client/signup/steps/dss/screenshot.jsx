/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

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
		themeSlug: React.PropTypes.string.isRequired,
		isLoading: React.PropTypes.bool,
		dssImage: React.PropTypes.object,
		markupAndStyles: React.PropTypes.object,
		renderComplete: React.PropTypes.bool
	},

	shouldShowLoadingIndicator() {
		// If the store is waiting on results, show loading.
		if ( this.props.isLoading ) {
			return true;
		}
		// If the image is preloading, show loading.
		if ( this.props.dssImage && ! this.props.renderComplete ) {
			return true;
		}
		return false;
	},

	getAdditionalStyles( imageUrl ) {
		return `#theme-${this.props.themeSlug} .hero.with-featured-image{background-image:url(${imageUrl});}`;
	},

	getPreviewStyles() {
		return { __html: this.props.markupAndStyles.styles };
	},

	getPreviewAdditionalStyles() {
		return { __html: this.props.dssImage ? this.getAdditionalStyles( this.props.dssImage.url ) : '' };
	},

	getPreviewMarkup() {
		return { __html: this.props.dssImage ? replaceMarkupWithImage( this.props.markupAndStyles.markup, this.props.dssImage.url ) : this.props.markupAndStyles.markup };
	},

	render() {
		const { markup, styles } = this.props.markupAndStyles || { markup: null, styles: null };
		const containerClassNames = classnames( 'dss-screenshot', {
			'is-loading': this.shouldShowLoadingIndicator(), // show the white overlay
			'is-preview-ready': markup && styles && this.props.dssImage // show the dynamic screenshot
		} );

		if ( markup && styles ) {
			return (
				<div className={ containerClassNames }>
					<div className="dss-screenshot__original">
						<img src={ this.props.screenshotUrl } alt={ this.translate( 'Loading…' ) } />
					</div>
					<div className="dss-screenshot__dynamic">
						<style dangerouslySetInnerHTML={ this.getPreviewStyles() } />
						<style dangerouslySetInnerHTML={ this.getPreviewAdditionalStyles() } />
						<div className="dss-screenshot__markup" dangerouslySetInnerHTML={ this.getPreviewMarkup() } />
					</div>
				</div>
			);
		}

		// Show the actual screenshot as a fallback while loading or if markup is not found
		return (
			<div className={ containerClassNames }>
				<div className="dss-screenshot__original">
					<img src={ this.props.screenshotUrl } alt={ this.translate( 'Loading…' ) } />
				</div>
			</div>
		);
	}

} );
