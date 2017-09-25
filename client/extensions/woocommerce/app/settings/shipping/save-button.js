/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import page from 'page';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import config from 'config';
import { successNotice, errorNotice } from 'state/notices/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getActionList } from 'woocommerce/state/action-list/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { areSetupChoicesLoading, getFinishedInitialSetup } from 'woocommerce/state/sites/setup-choices/selectors';
import { createWcsShippingSaveActionList } from 'woocommerce/woocommerce-services/state/actions';

class ShippingSettingsSaveButton extends Component {

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

	save = () => {
		if ( ! config.isEnabled( 'woocommerce/extension-wcservices' ) ) {
			return;
		}

		const { translate } = this.props;

		const successAction = successNotice(
			translate( 'Shipping settings saved' ),
			{ duration: 4000 }
		);

		const failureAction = errorNotice(
			translate( 'There was a problem saving the shipping settings. Please try again.' )
		);

		this.props.createWcsShippingSaveActionList( successAction, failureAction );
	}

	redirect = () => {
		const { site } = this.props;
		this.save();
		page.redirect( getLink( '/store/:site', site ) );
	}

	render() {
		const { translate, loading, site, finishedInitialSetup, isSaving } = this.props;
		const wcsEnabled = config.isEnabled( 'woocommerce/extension-wcservices' );

		if ( loading || ! site ) {
			return null;
		}

		if ( finishedInitialSetup ) {
			return wcsEnabled
				? <Button onClick={ this.save } primary busy={ isSaving } disabled={ isSaving }>{ translate( 'Save' ) }</Button>
				: null;
		}
		const label = wcsEnabled ? translate( 'Save and finish' ) : translate( 'I\'m Finished' );
		return <Button onClick={ this.redirect } primary busy={ isSaving } disabled={ isSaving }>{ label }</Button>;
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
		isSaving: Boolean( getActionList( state ) ),
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSetupChoices,
			createWcsShippingSaveActionList,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ShippingSettingsSaveButton ) );
