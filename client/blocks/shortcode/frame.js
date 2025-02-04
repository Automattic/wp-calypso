import clsx from 'clsx';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ResizableIframe from 'calypso/components/resizable-iframe';
import generateEmbedFrameMarkup from 'calypso/lib/embed-frame-markup';

export default class ShortcodeFrame extends Component {
	static propTypes = {
		body: PropTypes.string,
		scripts: PropTypes.object,
		style: PropTypes.object,
		onLoad: PropTypes.func,
		className: PropTypes.string,
		allowSameOrigin: PropTypes.bool,
	};

	static defaultProps = {
		onLoad: () => {},
		allowSameOrigin: false,
	};

	shouldComponentUpdate( nextProps ) {
		return generateEmbedFrameMarkup( this.props ) !== generateEmbedFrameMarkup( nextProps );
	}

	onFrameLoad = ( event ) => {
		// Transmit message to assign frame markup
		event.target.contentWindow.postMessage(
			JSON.stringify( {
				content: generateEmbedFrameMarkup( this.props ),
			} ),
			'*'
		);

		this.props.onLoad( event );
	};

	render() {
		const classes = clsx( 'shortcode-frame', this.props.className );

		if ( ! generateEmbedFrameMarkup( this.props ) ) {
			return null;
		}

		// We assign a random key to force a complete re-render any time we
		// reach this point. Unwanted re-renders are protected against via
		// `shouldComponentUpdate`
		const key = Math.random();

		const sandbox = clsx( {
			'allow-scripts': true,
			'allow-same-origin': this.props.allowSameOrigin,
		} );

		return (
			<ResizableIframe
				key={ key }
				{ ...omit( this.props, 'body', 'scripts', 'styles', 'allowSameOrigin' ) }
				src="https://wpcomwidgets.com/render/"
				onLoad={ this.onFrameLoad }
				frameBorder="0"
				sandbox={ sandbox }
				className={ classes }
			/>
		);
	}
}
