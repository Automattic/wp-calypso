/**
 * External dependencies
 */
import React, { Component } from 'react';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import accept from 'lib/accept';

class MigrateButton extends Component {
	state = {
		busy: false,
	};

	confirmCallback = accepted => {
		if ( accepted ) {
			this.setState( { busy: true }, this.props.onClick );
		} else {
			return;
		}
	};

	handleClick = () => {
		if ( this.state.busy ) {
			return;
		}

		const message =
			'Overwrite ' +
			this.props.targetSiteDomain +
			'? All posts, pages,' +
			' comments and media will be lost on this WordPress.com site.';

		accept( message, this.confirmCallback, 'Overwrite this site' );
	};

	render() {
		return (
			<Button primary busy={ this.state.busy } onClick={ this.handleClick }>
				{ this.props.children }
			</Button>
		);
	}
}

export default MigrateButton;
