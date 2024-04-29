import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { withI18n } from '@wordpress/react-i18n';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { recordStartTransferClickInThankYou } from 'calypso/state/domains/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import {
	getJetpackSearchCustomizeUrl,
	getJetpackSearchDashboardUrl,
} from 'calypso/state/sites/selectors';
import getCheckoutUpgradeIntent from '../../../state/selectors/get-checkout-upgrade-intent';
import './style.scss';

class CheckoutThankYouHeader extends PureComponent {
	static propTypes = {
		displayMode: PropTypes.string,
		isAtomic: PropTypes.bool,
		primaryCta: PropTypes.func,
		purchases: PropTypes.array,
		recordTracksEvent: PropTypes.func.isRequired,
		recordStartTransferClickInThankYou: PropTypes.func.isRequired,
		selectedSite: PropTypes.object,
		translate: PropTypes.func.isRequired,
		_n: PropTypes.func.isRequired,
		upgradeIntent: PropTypes.string,
		currency: PropTypes.string,
	};

	visitMyHome = ( event ) => {
		event.preventDefault();

		const { selectedSite } = this.props;

		this.props.recordTracksEvent( 'calypso_thank_you_no_site_receipt_error' );

		page( selectedSite?.slug ? `/home/${ selectedSite.slug }` : '/' );
	};

	visitSite = ( event ) => {
		event.preventDefault();

		const { selectedSite, primaryCta } = this.props;

		if ( primaryCta ) {
			return primaryCta();
		}

		window.location.href = selectedSite.URL;
	};

	visitSiteHostingSettings = ( event ) => {
		event.preventDefault();

		const { selectedSite } = this.props;

		this.props.recordTracksEvent( 'calypso_thank_you_back_to_hosting' );

		window.location.href = `/hosting-config/${ selectedSite.slug }`;
	};

	visitScheduler = ( event ) => {
		event.preventDefault();
		const { selectedSite } = this.props;

		//Maybe record tracks event

		window.location.href = '/me/quickstart/' + selectedSite.slug + '/book';
	};

	getButtonText = () => {
		const { displayMode, translate, upgradeIntent } = this.props;

		switch ( upgradeIntent ) {
			case 'browse_plugins':
				return translate( 'Continue Browsing Plugins' );
			case 'plugins':
			case 'install_plugin':
				return translate( 'Continue Installing Plugin' );
			case 'themes':
			case 'install_theme':
				return translate( 'Continue Installing Theme' );
		}

		if ( 'concierge' === displayMode ) {
			return translate( 'Schedule my session' );
		}

		return translate( 'Go to My Site' );
	};

	maybeGetSecondaryButton() {
		const { translate, upgradeIntent } = this.props;

		if ( upgradeIntent === 'hosting' ) {
			return (
				<Button onClick={ this.visitSiteHostingSettings }>
					{ translate( 'Return to Hosting' ) }
				</Button>
			);
		}

		return null;
	}

	getButtons() {
		const { selectedSite, displayMode, isAtomic } = this.props;
		const headerButtonClassName = 'button is-primary';
		const isConciergePurchase = 'concierge' === displayMode;

		if ( ! isConciergePurchase && ( ! selectedSite || ( selectedSite.jetpack && ! isAtomic ) ) ) {
			return null;
		}

		let clickHandler = this.visitSite;

		if ( isConciergePurchase ) {
			clickHandler = this.visitScheduler;
		}

		return (
			<div className="checkout-thank-you__header-button">
				{ this.maybeGetSecondaryButton() }
				<button className={ headerButtonClassName } onClick={ clickHandler }>
					{ this.getButtonText() }
				</button>
			</div>
		);
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="checkout-thank-you__header">
				<div className="checkout-thank-you__header-icon">
					<img src="/calypso/images/upgrades/thank-you.svg" alt="" />
				</div>
				<div className="checkout-thank-you__header-content">
					<div className="checkout-thank-you__header-copy">
						<h1 className="checkout-thank-you__header-heading">
							{ preventWidows( translate( 'Congratulations on your purchase!' ) ) }
						</h1>
						{ this.props.children }
						{ this.getButtons() }
					</div>
				</div>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isAtomic: isAtomicSite( state, ownProps.selectedSite?.ID ),
		jetpackSearchCustomizeUrl: getJetpackSearchCustomizeUrl( state, ownProps.selectedSite?.ID ),
		jetpackSearchDashboardUrl: getJetpackSearchDashboardUrl( state, ownProps.selectedSite?.ID ),
		upgradeIntent: ownProps.upgradeIntent || getCheckoutUpgradeIntent( state ),
	} ),
	{
		recordStartTransferClickInThankYou,
		recordTracksEvent,
	}
)( localize( withI18n( CheckoutThankYouHeader ) ) );
