/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';

class ImportButton extends Component {
	trackImportClick = () => {
		this.props.recordTracksEvent( 'calypso_signup_import_cta_click' );
	};

	render() {
		const { translate } = this.props;

		if ( ! isEnabled( 'signup/import-flow' ) ) {
			return null;
		}

		return (
			<div className="site-type__buttons site-type__import">
				<Button borderless href="/start/import" onClick={ this.trackImportClick }>
					{ translate( 'Already have a website?' ) }
				</Button>
			</div>
		);
	}
}

export default connect(
	null,
	{ recordTracksEvent }
)( localize( ImportButton ) );
