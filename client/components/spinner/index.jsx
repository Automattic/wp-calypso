/** @ssr-ready **/

/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Module variables
 */
var Spinner;

Spinner = React.createClass( {
	propTypes: {
		className: React.PropTypes.string,
		size: React.PropTypes.number,
		duration: React.PropTypes.number
	},

	statics: {
		instances: 0
	},

	getDefaultProps: function() {
		return {
			size: 20,
			duration: 3000
		};
	},

	componentWillMount: function() {
		this.setState( {
			instanceId: ++Spinner.instances
		} );
	},

	/**
	 * Returns whether the current browser supports CSS animations for SVG
	 * elements. Specifically, this returns false for Internet Explorer
	 * versions 11 and below.
	 *
	 * @see http://dev.modern.ie/platform/status/csstransitionsanimationsforsvgelements/
	 * @return {Boolean} True if the browser supports CSS animations for SVG
	 *                   elements, or false otherwise.
	 */
	isSVGCSSAnimationSupported: function() {
		const navigator = global.window ? global.window.navigator.userAgent : ''; // FIXME: replace with UA from server
		return ! /(MSIE |Trident\/)/.test( navigator );
	},

	getClassName: function() {
		return classNames( 'spinner', this.props.className, {
			'is-fallback': ! this.isSVGCSSAnimationSupported()
		} );
	},

	renderFallback: function() {
		var style = {
			width: this.props.size,
			height: this.props.size
		};

		return (
			<div className={ this.getClassName() } style={ style }>
				<span className="spinner__progress is-left"></span>
				<span className="spinner__progress is-right"></span>
			</div>
		);
	},

	render: function() {
		var instanceId = parseInt( this.state.instanceId, 10 );

		if ( ! this.isSVGCSSAnimationSupported() ) {
			return this.renderFallback();
		}

		// We're using `dangerouslySetInnerHTML` for the SVG, as React unfortunately doesn't support
		// SVG's `mask` attribute, see https://github.com/facebook/react/issues/1657#issuecomment-63209488
		// The only variable we're using inside is `instanceId`, which is an (integer) counter
		// we generate ourselves, so we're fine.
		/*eslint-disable react/no-danger*/
		return (
			<div className={ this.getClassName() }>
				<svg className="spinner__image"
					width={ this.props.size }
					height={ this.props.size }
					viewBox="0 0 100 100"
					dangerouslySetInnerHTML={ { __html: `
					<defs>
						<mask id="maskBorder${ instanceId }">
							<rect x="0" y="0" width="100%" height="100%" fill="white" />
							<circle r="46%" cx="50%" cy="50%" fill="black" />
						</mask>
						<mask id="maskDonut${ instanceId }">
							<rect x="0" y="0" width="100%" height="100%" fill="black" />
							<circle r="46%" cx="50%" cy="50%" fill="white" />
							<circle r="30%" cx="50%" cy="50%" fill="black" />
						</mask>
						<mask id="maskLeft${ instanceId }">
							<rect x="0" y="0" width="50%" height="100%" fill="white" />
						</mask>
						<mask id="maskRight${ instanceId }">
							<rect x="50%" y="0" width="50%" height="100%" fill="white" />
						</mask>
					</defs>
					<circle class="spinner__border" r="50%" cx="50%" cy="50%" mask="url( #maskBorder${ instanceId } )" />
					<g mask="url( #maskDonut${ instanceId } )">
						<g mask="url( #maskLeft${ instanceId } )">
							<rect class="spinner__progress is-left" x="0" y="0" width="50%" height="100%" />
						</g>
						<g mask="url( #maskRight${ instanceId } )">
							<rect class="spinner__progress is-right" x="50%" y="0" width="50%" height="100%" />
						</g>
					</g>
				` } } />
			</div>
		);
		/*eslint-enable react/no-danger*/
	}
} );

module.exports = Spinner;
