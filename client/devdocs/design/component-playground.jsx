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
import ClipboardButton from 'components/forms/clipboard-button';

class ComponentPlayground extends Component {
	static propTypes = {
		code: PropTypes.string,
		scope: PropTypes.object,
		showCode: PropTypes.bool,
	};

	static defaultProps = {
		showCode: false,
	};

	render() {
		return (
			<LiveProvider
				code={ this.props.code }
				scope={ this.props.scope }
				mountStylesheet={ false }
				className="design__component-playground"
			>
				<LivePreview />

				{ this.props.showCode && (
					<div className="design__component-playground-code">
						<ClipboardButton
							text={ this.props.code }
							borderless
							onClick={ function() {
								alert( 'Copied to clipboard!' );
							} }
							className="design__component-playground-clipboard"
						>
							Copy code <Gridicon icon="clipboard" />
						</ClipboardButton>

						<LiveError />
						<LiveEditor />
					</div>
				) }
			</LiveProvider>
		);
	}
}

ComponentPlayground.displayName = 'ComponentPlayground';
export default ComponentPlayground;
