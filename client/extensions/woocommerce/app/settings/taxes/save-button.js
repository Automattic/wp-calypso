/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import {
	areSetupChoicesLoading,
	getFinishedInitialSetup,
} from 'woocommerce/state/sites/setup-choices/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';

class TaxSettingsSaveButton extends Component {
	static propTypes = {
		onSave: PropTypes.func.isRequired,
	};

	onSave = ( e ) => {
		const { onSave, finishedInitialSetup, site } = this.props;

		let onSuccessExtra = null;
		if ( ! finishedInitialSetup ) {
			onSuccessExtra = () => {
				page.redirect( getLink( '/store/:site', site ) );
			};
		}

		onSave( e, onSuccessExtra );
	};

	render() {
		const { translate, loading, site, finishedInitialSetup } = this.props;

		if ( loading || ! site ) {
			return null;
		}

		const saveMessage = finishedInitialSetup ? translate( 'Save' ) : translate( 'Save & Finish' );

		return (
			<Button onClick={ this.onSave } primary>
				{ saveMessage }
			</Button>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const loading = areSetupChoicesLoading( state );
	const finishedInitialSetup = getFinishedInitialSetup( state );
	return {
		site,
		finishedInitialSetup,
		loading,
	};
}

export default connect( mapStateToProps )( localize( TaxSettingsSaveButton ) );
