/**
 * External dependencies
 */
import React, { Component } from 'react';
import { Button } from '@automattic/components';

class MigrateButton extends Component {
	state = {
		busy: false,
	};

	handleClick = () => {
		if ( this.state.busy ) {
			return;
		}

		this.setState( { busy: true }, this.props.onClick );
	};

	render() {
		return (
			<Button primary busy={ this.state.busy } onClick={ this.handleClick }>
				Migrate site
			</Button>
		);
	}
}

export default MigrateButton;
