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
import Button from 'components/button';
import { isEnabled } from 'config';
import { abtest } from 'lib/abtest';
import { recordTracksEvent } from 'state/analytics/actions';

class ImportButton extends Component {
	trackImportClick = () => {
		this.props.recordTracksEvent( 'calypso_signup_import_cta_click' );
	};

	render() {
		const { translate } = this.props;

		if (
			! isEnabled( 'signup/import-flow' ) ||
			'show' !== abtest( 'showImportFlowInSiteTypeStep' )
		) {
			return null;
		}

		return (
			<div className="site-type__import-buttons">
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
