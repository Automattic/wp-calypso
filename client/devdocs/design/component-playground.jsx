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
	};

	onClick = () => {
		this.setState( { showCode: ! this.state.showCode } );
	};

	render() {
		return (
			<LiveProvider code={ this.props.code } scope={ this.props.scope } mountStylesheet={ false }>
				<LivePreview />
				<Button onClick={ this.onClick } borderless={ true }>
					View Code <Gridicon icon="code" />
				</Button>
				<div>
					{ this.state.showCode && <LiveError /> }
					{ this.state.showCode && <LiveEditor /> }
				</div>
			</LiveProvider>
		);
	}
}

ComponentPlayground.displayName = 'ComponentPlayground';
export default ComponentPlayground;
