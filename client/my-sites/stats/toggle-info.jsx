/**
 * External dependencies
 */

import React, { Component } from 'react';

const toggleInfo = ( WrappedComponent ) =>
	class ToggleComponent extends Component {
		state = {
			open: false,
		};

		toggle = ( event ) => {
			event.preventDefault();
			this.setState( {
				open: ! this.state.open,
			} );
		};

		render() {
			return (
				<WrappedComponent { ...this.props } toggle={ this.toggle } opened={ this.state.open } />
			);
		}
	};

export default toggleInfo;
