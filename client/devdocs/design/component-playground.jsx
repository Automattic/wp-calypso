/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ClipboardButton from 'components/forms/clipboard-button';
import DocsExampleWrapper from 'devdocs/docs-example/wrapper';

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
			showCode: ! this.state.showCode,
		} );
	};

	render() {
		const toggleCode = this.props.code.length > 200;
		const codeClassName = classNames( {
			'design__component-playground-code': true,
			'show-code': toggleCode ? this.state.showCode : true,
		} );
		const scope = require( 'devdocs/design/playground-scope' );

		return (
			<LiveProvider
				code={ this.props.code }
				scope={ scope }
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

				{ this.props.component && (
					<div className={ codeClassName }>
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

				{ this.props.component && toggleCode && (
					<div className="design__component-playground-show-code">
						<Button onClick={ this.showCode }>
							{ this.state.showCode ? 'Hide' : 'Show' } code <Gridicon icon="code" />
						</Button>
					</div>
				) }
			</LiveProvider>
		);
	}
}

ComponentPlayground.displayName = 'ComponentPlayground';
export default ComponentPlayground;
