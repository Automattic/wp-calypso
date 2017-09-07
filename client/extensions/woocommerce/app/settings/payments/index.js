/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import {
	createPaymentSettingsActionList,
} from 'woocommerce/state/ui/payments/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { getActionList } from 'woocommerce/state/action-list/selectors';
import { getFinishedInitialSetup } from 'woocommerce/state/sites/setup-choices/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import SettingsPaymentsLocationCurrency from './payments-location-currency';
import SettingsNavigation from '../navigation';
import SettingsPaymentsOffline from './payments-offline';
import SettingsPaymentsOffSite from './payments-off-site';
import SettingsPaymentsOnSite from './payments-on-site';

class SettingsPayments extends Component {

	static propTypes = {
		isSaving: PropTypes.bool,
		site: PropTypes.shape( {
			slug: PropTypes.string,
		} ),
		className: PropTypes.string,
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

	onSave = () => {
		const { translate, site, finishedInitialSetup } = this.props;
		const successAction = () => {
			if ( ! finishedInitialSetup ) {
				page.redirect( getLink( '/store/:site', site ) );
			}

			return successNotice(
				translate( 'Payment settings saved.' ),
				{ duration: 4000, displayOnNextPage: true }
			);
		};

		const failureAction = errorNotice(
			translate( 'There was a problem saving the payment settings. Please try again.' )
		);

		this.props.createPaymentSettingsActionList( successAction, failureAction );
	}

	render() {
		const { isSaving, site, translate, className, finishedInitialSetup } = this.props;

		const breadcrumbs = [
			( <a href={ getLink( '/store/:site/', site ) }>{ translate( 'Settings' ) }</a> ),
			( <span>{ translate( 'Payments' ) }</span> ),
		];

		const saveMessage = finishedInitialSetup ? translate( 'Save' ) : translate( 'Save & Finish' );
		return (
			<Main
				className={ classNames( 'settingsPayments', className ) }>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<Button
						primary
						onClick={ this.onSave }
						busy={ isSaving }
						disabled={ isSaving }>
						{ saveMessage }
					</Button>
				</ActionHeader>
				<SettingsNavigation activeSection="payments" />
				<SettingsPaymentsLocationCurrency />
				<SettingsPaymentsOnSite />
				<SettingsPaymentsOffSite />
				<SettingsPaymentsOffline />
			</Main>
		);
	}

}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const finishedInitialSetup = getFinishedInitialSetup( state );
	return {
		isSaving: Boolean( getActionList( state ) ),
		site,
		finishedInitialSetup,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators( {
		createPaymentSettingsActionList,
		fetchSetupChoices,
	}, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( SettingsPayments ) );
