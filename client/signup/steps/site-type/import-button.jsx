/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
	static propTypes = {
		goToNextStep: PropTypes.func.isRequired,

		// from localize() HoC
		translate: PropTypes.func.isRequired,
	};

	trackImportClick = () => {
		this.props.recordTracksEvent( 'calypso_signup_import_cta_click' );
		this.props.goToNextStep( 'import' );
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
				<Button borderless onClick={ this.trackImportClick }>
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
