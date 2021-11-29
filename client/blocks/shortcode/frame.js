import classNames from 'classnames';
import { isEqual, omit } from 'lodash';
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

	state = {
		html: '',
	};

	componentDidMount() {
		this.updateHtmlState( this.props );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props, nextProps ) ) {
			this.updateHtmlState( nextProps );
		}
	}

	shouldComponentUpdate( nextProps, nextState ) {
		return nextState.html !== this.state.html;
	}

	updateHtmlState = ( props ) => {
		this.setState( {
			html: generateEmbedFrameMarkup( props ),
		} );
	};

	onFrameLoad = ( event ) => {
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

		const sandbox = classNames( {
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
