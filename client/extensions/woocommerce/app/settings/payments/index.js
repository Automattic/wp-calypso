/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import {
	createPaymentSettingsActionList,
} from 'woocommerce/state/ui/payments/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { getActionList } from 'woocommerce/state/action-list/selectors';
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

	onSave = () => {
		const { translate } = this.props;

		const successAction = successNotice(
			translate( 'Payment settings saved.' ),
			{ duration: 4000 }
		);

		const failureAction = errorNotice(
			translate( 'There was a problem saving the payment settings. Please try again.' )
		);

		this.props.createPaymentSettingsActionList( successAction, failureAction );
	}

	render() {
		const { isSaving, site, translate, className } = this.props;

		const breadcrumbs = [
			( <a href={ getLink( '/store/:site/', site ) }>{ translate( 'Settings' ) }</a> ),
			( <span>{ translate( 'Payments' ) }</span> ),
		];

		return (
			<Main
				className={ classNames( 'settingsPayments', className ) }>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<Button
						primary
						onClick={ this.onSave }
						busy={ isSaving }
						disabled={ isSaving }>
						{ translate( 'Save' ) }
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
	return {
		isSaving: Boolean( getActionList( state ) ),
		site,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators( {
		createPaymentSettingsActionList,
	}, dispatch );
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( SettingsPayments ) );
