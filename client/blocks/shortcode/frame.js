/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { isEqual, omit } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import generateEmbedFrameMarkup from 'lib/embed-frame-markup';
import ResizableIframe from 'components/resizable-iframe';

export default class extends React.Component {
	static displayName = 'ShortcodeFrame';

	static propTypes = {
		body: PropTypes.string,
		scripts: PropTypes.object,
		style: PropTypes.object,
		onLoad: PropTypes.func,
		className: PropTypes.string,
	};

	static defaultProps = {
		onLoad: () => {},
	};

	state = {
		html: '',
	};

	componentDidMount() {
		this.updateHtmlState( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props, nextProps ) ) {
			this.updateHtmlState( nextProps );
		}
	}

	shouldComponentUpdate( nextProps, nextState ) {
		return nextState.html !== this.state.html;
	}

	updateHtmlState = props => {
		this.setState( {
			html: generateEmbedFrameMarkup( props ),
		} );
	};

	onFrameLoad = event => {
		// Transmit message to assign frame markup
		event.target.contentWindow.postMessage(
			JSON.stringify( {
				content: this.state.html,
			} ),
			'*'
		);

		this.props.onLoad( event );
	};

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
				{ ...omit( this.props, 'body', 'scripts', 'styles' ) }
				src="https://wpcomwidgets.com/render/"
				onLoad={ this.onFrameLoad }
				frameBorder="0"
				sandbox="allow-scripts"
				className={ classes }
			/>
		);
	}
}
