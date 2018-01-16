/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';

class Translate extends Component {
	state = {
		showTooltip: false,
	};

	refCallback = elem => ( this.elem = elem );

	render() {
		return (
			<data
				title={ 'do it' }
				className="translate"
				onContextMenu={ () => this.setState( { showTooltip: true } ) }
				{ ...this.props }
			>
				{ this.props.children }
				<Popover
					isVisible={ this.state.showTooltip }
					context={ this.elem }
					onClose={ () => {} }
					position="bottom"
					className="popover tooltip is-dialog-visible"
				>
					<p>CTadfadfadf adfadf adf adf adf adf adf adf </p>
					<p>CTadfadfadf adfadf adf adf adf adf adf adf </p>
					<p>CTadfadfadf adfadf adf adf adf adf adf adf </p>
					<p>CTadfadfadf adfadf adf adf adf adf adf adf </p>
				</Popover>
			</data>
		);
	}
}

export default Translate;
