import { isDelayedDomainTransfer } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { withI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { domainManagementTransferInPrecheck } from 'calypso/my-sites/domains/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { recordStartTransferClickInThankYou } from 'calypso/state/domains/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import {
	getJetpackSearchCustomizeUrl,
	getJetpackSearchDashboardUrl,
} from 'calypso/state/sites/selectors';
import getCheckoutUpgradeIntent from '../../../state/selectors/get-checkout-upgrade-intent';
import './style.scss';

export class CheckoutThankYouHeader extends PureComponent {
	static propTypes = {
		displayMode: PropTypes.string,
		hasFailedPurchases: PropTypes.bool,
		isAtomic: PropTypes.bool,
		isDataLoaded: PropTypes.bool.isRequired,
		primaryCta: PropTypes.func,
		primaryPurchase: PropTypes.object,
		purchases: PropTypes.array,
		recordTracksEvent: PropTypes.func.isRequired,
		recordStartTransferClickInThankYou: PropTypes.func.isRequired,
		selectedSite: PropTypes.object,
		translate: PropTypes.func.isRequired,
		_n: PropTypes.func.isRequired,
		upgradeIntent: PropTypes.string,
		currency: PropTypes.string,
	};

	getText() {
		const { translate, isDataLoaded, hasFailedPurchases, primaryPurchase, displayMode } =
			this.props;

		if ( hasFailedPurchases ) {
			return translate( 'Some of the items in your cart could not be added.' );
		}

		if ( ! isDataLoaded || ! primaryPurchase ) {
			if ( 'concierge' === displayMode ) {
				return translate(
					'You will receive an email confirmation shortly,' +
						' along with detailed instructions to schedule your call with us.'
				);
			}

			return translate( 'You will receive an email confirmation shortly.' );
		}

		if ( isDelayedDomainTransfer( primaryPurchase ) ) {
			return translate(
				'Your new site is now live, with a temporary domain. Start the transfer to get your domain ' +
					'{{strong}}%(domainName)s{{/strong}} moved to WordPress.com.',
				{
					args: { domainName: primaryPurchase.meta },
					components: { strong: <strong /> },
				}
			);
		}

		return translate(
			"You will receive an email confirmation shortly for your purchase of {{strong}}%(productName)s{{/strong}}. What's next?",
			{
				args: {
					productName: primaryPurchase.productName,
				},
				components: {
					strong: <strong />,
				},
			}
		);
	}
	visitMyHome = ( event ) => {
		event.preventDefault();

		const { selectedSite } = this.props;

		this.props.recordTracksEvent( 'calypso_thank_you_no_site_receipt_error' );

		page( selectedSite?.slug ? `/home/${ selectedSite.slug }` : '/' );
	};

	visitSite = ( event ) => {
		event.preventDefault();

		const { primaryPurchase, selectedSite, primaryCta } = this.props;

		this.props.recordTracksEvent( 'calypso_thank_you_view_site', {
			product: primaryPurchase.productName,
		} );

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

	startTransfer = ( event ) => {
		event.preventDefault();

		const { primaryPurchase, selectedSite } = this.props;

		this.props.recordStartTransferClickInThankYou( primaryPurchase.meta );

		page( domainManagementTransferInPrecheck( selectedSite.slug, primaryPurchase.meta ) );
	};

	getButtonText = () => {
		const { displayMode, hasFailedPurchases, selectedSite, translate, upgradeIntent } = this.props;

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

		if ( ! selectedSite.slug && hasFailedPurchases ) {
			return translate( 'Register domain' );
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
		const {
			hasFailedPurchases,
			isDataLoaded,
			translate,
			primaryPurchase,
			selectedSite,
			displayMode,
			isAtomic,
		} = this.props;
		const headerButtonClassName = 'button is-primary';
		const isConciergePurchase = 'concierge' === displayMode;

		if (
			isDataLoaded &&
			( ! primaryPurchase || ! selectedSite || ( selectedSite.jetpack && ! isAtomic ) )
		) {
			return (
				<div className="checkout-thank-you__header-button">
					<Button className={ headerButtonClassName } primary onClick={ this.visitMyHome }>
						{ translate( 'Go to My Home' ) }
					</Button>
				</div>
			);
		}

		if (
			! isConciergePurchase &&
			( hasFailedPurchases ||
				! primaryPurchase ||
				! selectedSite ||
				( selectedSite.jetpack && ! isAtomic ) )
		) {
			return null;
		}

		if ( primaryPurchase && isDelayedDomainTransfer( primaryPurchase ) ) {
			return (
				<div className="checkout-thank-you__header-button">
					<button className={ headerButtonClassName } onClick={ this.startTransfer }>
						{ translate( 'Start domain transfer' ) }
					</button>
				</div>
			);
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

	getHeaderText() {
		const { isDataLoaded, hasFailedPurchases, primaryPurchase, translate } = this.props;

		if ( ! isDataLoaded ) {
			return translate( 'Loading…' );
		}

		if ( hasFailedPurchases ) {
			return translate( 'Some items failed.' );
		}

		if ( primaryPurchase && isDelayedDomainTransfer( primaryPurchase ) ) {
			return preventWidows( translate( 'Almost done!' ) );
		}

		return translate( 'Congratulations on your purchase!' );
	}

	render() {
		const { isDataLoaded, hasFailedPurchases, primaryPurchase } = this.props;
		const classes = { 'is-placeholder': ! isDataLoaded };

		let svg = 'thank-you.svg';
		if ( hasFailedPurchases ) {
			svg = 'items-failed.svg';
		} else if ( primaryPurchase && isDelayedDomainTransfer( primaryPurchase ) ) {
			svg = 'publish-button.svg';
		}
		return (
			<div className={ classNames( 'checkout-thank-you__header', classes ) }>
				<div className="checkout-thank-you__header-icon">
					<img src={ `/calypso/images/upgrades/${ svg }` } alt="" />
				</div>
				<div className="checkout-thank-you__header-content">
					<div className="checkout-thank-you__header-copy">
						<h1 className="checkout-thank-you__header-heading">
							{ preventWidows( this.getHeaderText() ) }
						</h1>
						<h2 className="checkout-thank-you__header-text">{ this.getText() }</h2>
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
