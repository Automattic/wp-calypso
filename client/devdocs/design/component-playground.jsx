/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ClipboardButton from 'components/forms/clipboard-button';
import Popover from 'components/popover';

class ComponentPlayground extends Component {
	static propTypes = {
		code: PropTypes.string,
		scope: PropTypes.object,
		showCode: PropTypes.bool,
	};

	static defaultProps = {
		showCode: false,
	};

	state = {
		showCode: this.props.showCode,
		showPopover: false,
	};

	onClick = () => {
		this.setState( { showPopover: ! this.state.showPopover } );
	};

	render() {
		return (
			<div className="design__component-playground">
				<LiveProvider code={ this.props.code } scope={ this.props.scope } mountStylesheet={ false }>
					<LivePreview />
				</LiveProvider>
				<div className="design__component-playground-button">
					<Button ref="popoverButton" onClick={ this.onClick } borderless>
						<Gridicon icon="code" />
					</Button>
				</div>

				<Popover
					context={ this.refs && this.refs.popoverButton }
					isVisible={ this.state.showPopover }
					onClose={ this.closePopover }
					className="design__component-playground-popover"
					position="left"
				>
					<ClipboardButton
						text={ this.props.code }
						borderless
						onClick={ function() {
							alert( 'Copied to clipboard!' );
						} }
						className="design__component-playground-clipboard"
					>
						<Gridicon icon="clipboard" />
					</ClipboardButton>

					<LiveProvider
						code={ this.props.code }
						scope={ this.props.scope }
						mountStylesheet={ false }
					>
						<LiveError />
						<LiveEditor />
					</LiveProvider>
				</Popover>
			</div>
		);
	}
}

ComponentPlayground.displayName = 'ComponentPlayground';
export default ComponentPlayground;
