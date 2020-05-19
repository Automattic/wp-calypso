/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import accept from 'lib/accept';
import { recordTracksEvent } from 'state/analytics/actions';

class MigrateButton extends Component {
	state = {
		busy: false,
	};

	confirmCallback = ( accepted ) => {
		if ( accepted ) {
			this.props.recordTracksEvent( 'calypso_site_migration_start_confirm_clicked' );
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
				<h1>{ translate( 'Import and replace everything on this site?' ) }</h1>
				<div>
					{ translate( 'All posts, pages, comments and media will be lost on %(targetDomain)s.', {
						args: {
							targetDomain: this.props.targetSiteDomain,
						},
					} ) }
				</div>
			</>
		);

		this.props.recordTracksEvent( 'calypso_site_migration_start_clicked' );

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

export default connect( null, { recordTracksEvent } )( localize( MigrateButton ) );
