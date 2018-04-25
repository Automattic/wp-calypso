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
import DocsExampleWrapper from 'devdocs/docs-example/wrapper';
import * as playgroundScope from 'devdocs/design/playground-scope';

class ComponentPlayground extends Component {
	static propTypes = {
		code: PropTypes.string,
	};

	state = {
		showCode: false,
	};

	handleClick() {
		alert( 'Copied to clipboard!' );
	}

	showCode = () => {
		this.setState( {
			showCode: true,
		} );
	};

	render() {
		return (
			<LiveProvider
				code={ this.props.code }
				scope={ playgroundScope }
				mountStylesheet={ false }
				className="design__component-playground"
			>
				<DocsExampleWrapper
					name={ this.props.name }
					unique={ this.props.unique }
					url={ this.props.url }
				>
					<LivePreview />
				</DocsExampleWrapper>

				{ this.props.component &&
					! this.state.showCode && (
						<div className="design__component-playground-show-code">
							<Button borderless onClick={ this.showCode }>
								Show code <Gridicon icon="code" />
							</Button>
						</div>
					) }

				{ this.props.component &&
					this.state.showCode && (
						<div className="design__component-playground-code">
							<ClipboardButton
								text={ this.props.code }
								borderless
								onClick={ this.handleClick }
								className="design__component-playground-clipboard"
							>
								<Gridicon icon="clipboard" />
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
