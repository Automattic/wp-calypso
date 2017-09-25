/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import ReactDom from 'react-dom';
import Clipboard from 'clipboard';
import { omit, noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class ClipboardButton extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		text: PropTypes.string,
		onCopy: PropTypes.func,
		// from localize()
		moment: PropTypes.func,
		numberFormat: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		onCopy: noop,
	};

	componentDidMount() {
		const button = ReactDom.findDOMNode( this.refs.button );
		this.clipboard = new Clipboard( button, {
			text: () => this.props.text,
		} );
		this.clipboard.on( 'success', this.props.onCopy );
		this.clipboard.on( 'error', this.displayPrompt );
	}

	componentWillUnmount() {
		this.clipboard.destroy();
		delete this.clipboard;
	}

	displayPrompt = () => {
		window.prompt(
			this.props.translate( 'Highlight and copy the following text to your clipboard:' ),
			this.props.text
		);
	};

	render() {
		const classes = classNames( 'clipboard-button', this.props.className );

		return (
			<Button
				ref="button"
				{ ...omit( this.props, Object.keys( this.constructor.propTypes ) ) }
				className={ classes }
			/>
		);
	}
}

export default localize( ClipboardButton );
