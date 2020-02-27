/**
 * External dependencies
 */
import React, { Component } from 'react';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
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
		const { translate } = this.props;

		if ( this.state.busy ) {
			return;
		}

		const message = (
			<>
				<h1>
					{ translate( 'Import and overwrite everything on %(targetDomain)s?', {
						args: {
							targetDomain: this.props.targetSiteDomain,
						},
					} ) }
				</h1>
				<div>
					{ translate(
						'All posts, pages, comments and media will be lost on this WordPress.com site.'
					) }
				</div>
			</>
		);

		accept( message, this.confirmCallback, translate( 'Import and overwrite' ) );
	};

	render() {
		return (
			<Button primary busy={ this.state.busy } onClick={ this.handleClick }>
				{ this.props.children }
			</Button>
		);
	}
}

export default localize( MigrateButton );
