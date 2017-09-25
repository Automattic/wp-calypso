/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { areSetupChoicesLoading, getFinishedInitialSetup } from 'woocommerce/state/sites/setup-choices/selectors';

class TaxSettingsSaveButton extends Component {

	static propTypes = {
		onSave: PropTypes.func.isRequired,
	};

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchSetupChoices( site.ID );
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		const { site } = this.props;

		const newSiteId = newProps.site ? newProps.site.ID : null;
		const oldSiteId = site ? site.ID : null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchSetupChoices( newSiteId );
		}
	}

	onSave = ( e ) => {
		const { onSave, finishedInitialSetup, site } = this.props;

		let onSuccessExtra = null;
		if ( ! finishedInitialSetup ) {
			onSuccessExtra = () => {
				page.redirect( getLink( '/store/:site', site ) );
			};
		}

		onSave( e, onSuccessExtra );
	}

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

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSetupChoices,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( TaxSettingsSaveButton ) );
