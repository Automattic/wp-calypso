/**
 * External dependencies
 */
import ReactDomServer from 'react-dom/server';
import React, { PropTypes } from 'react';
import createFragment from 'react-addons-create-fragment';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import mapValues from 'lodash/mapValues';

/**
 * Internal dependencies
 */
import ResizableIframe from 'components/resizable-iframe'

/**
 * Module variables
 */
const JQUERY_URL = 'https://s0.wp.com/wp-includes/js/jquery/jquery.js';

function buildFrameBody( { body, scripts, styles } = { body: '', scripts: {}, styles: {} } ) {
	if ( ! body && ! scripts && ! styles ) {
		return '';
	}

	let fragment = {};

	fragment.styles = mapValues( styles, ( style ) => {
		return <link rel="stylesheet" media={ style.media } href={ style.src } />;
	} );

	fragment.scripts = mapValues( scripts, ( script ) => {
		let extra;
		if ( script.extra ) {
			/*eslint-disable react/no-danger*/
			extra = (
				<script dangerouslySetInnerHTML={ {
					__html: script.extra
				} } />
			);
			/*eslint-enable react/no-danger*/
		}

		return createFragment( {
			extra: extra,
			script: <script src={ script.src } />
		} );
	} );

	/*eslint-disable react/no-danger*/
	return ReactDomServer.renderToStaticMarkup(
		<html>
			<head>
				{ createFragment( fragment.styles ) }
				<style dangerouslySetInnerHTML={ { __html: 'a { cursor: default; }' } } />
			</head>
			<body style={ { margin: 0 } }>
				<div dangerouslySetInnerHTML={ { __html: body } } />
				{ /* Many shortcode scripts assume jQuery is already defined */ }
				<script src={ JQUERY_URL } />
				<script dangerouslySetInnerHTML={ { __html: `
					[ 'click', 'dragstart' ].forEach( function( type ) {
						document.addEventListener( type, function( event ) {
							event.preventDefault();
							event.stopImmediatePropagation();
						}, true );
					} );
				` } } />
				{ createFragment( fragment.scripts ) }
			</body>
		</html>
	);
	/*eslint-enable react/no-danger*/
}

export default React.createClass( {
	displayName: 'ShortcodeFrame',

	propTypes: {
		body: PropTypes.string,
		scripts: PropTypes.object,
		style: PropTypes.object,
		onLoad: PropTypes.func,
		className: PropTypes.string
	},

	getDefaultProps() {
		return {
			onLoad: () => {}
		}
	},

	getInitialState: function() {
		return {
			html: ''
		};
	},

	componentDidMount() {
		this.updateHtmlState( this.props );
	},

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props, nextProps ) ) {
			this.updateHtmlState( nextProps );
		}
	},

	shouldComponentUpdate( nextProps, nextState ) {
		return nextState.html !== this.state.html;
	},

	updateHtmlState( props ) {
		this.setState( {
			html: buildFrameBody( props )
		} );
	},

	onFrameLoad( event ) {
		// Transmit message to assign frame markup
		event.target.contentWindow.postMessage( JSON.stringify( {
			content: this.state.html
		} ), '*' );

		this.props.onLoad( event );
	},

	render() {
		const classes = classNames( 'shortcode-frame', this.props.className );

		if ( ! this.state.html ) {
			return null;
		}

		// We assign a random key to force a complete re-render any time we
		// reach this point. Unwanted re-renders are protected against via
		// `shouldComponentUpdate`
		const key = Math.random();

		return (
			<ResizableIframe
				key={ key }
				{ ...omit( this.props, 'body', 'scripts', 'style' ) }
				src="https://wpcomwidgets.com/render/"
				onLoad={ this.onFrameLoad }
				frameBorder="0"
				sandbox="allow-scripts"
				className={ classes } />
		);
	}
} );
