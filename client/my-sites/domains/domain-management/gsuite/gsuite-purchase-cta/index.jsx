/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import { ADDING_GOOGLE_APPS_TO_YOUR_SITE } from 'lib/url/support';
import Button from 'components/forms/form-button';
import CompactCard from 'components/card/compact';
import config from 'config';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { emailManagementAddGSuiteUsers } from 'my-sites/email/paths';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getAnnualPrice, getMonthlyPrice } from 'lib/google-apps';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import { getEligibleDomain } from 'lib/domains/gsuite';

/**
 * Style dependencies
 */
import './style.scss';

class GSuitePurchaseCta extends React.Component {
	handleLearnMoreClick = () => {
		this.props.learnMoreClick( this.props.domainName );
	};

	goToAddGoogleApps = () => {
		page( emailManagementAddGSuiteUsers( this.props.selectedSite.slug, this.props.domainName ) );
	};

	getStorageText() {
		const { product, translate } = this.props;
		if ( 'gapps' === product.product_slug ) {
			return translate( 'Get 30GB of storage for all your files synced across devices.' );
		} else if ( 'gappsbusiness' === product.product_slug ) {
			return translate( 'Get 30GB of storage for all your files synced across devices.' );
		}
	}

	getPlanText() {
		const { product, translate } = this.props;
		if ( 'gappsbusiness' === product.product_slug ) {
			return translate( 'Business' );
		}
	}

	renderCta() {
		const { currencyCode, domainName, translate } = this.props;
		const price = get( this.props, [ 'product', 'prices', currencyCode ], 0 );
		const annualPrice = getAnnualPrice( price, currencyCode );
		const monthlyPrice = getMonthlyPrice( price, currencyCode );
		const upgradeAvailable = config.isEnabled( 'upgrades/checkout' );

		return (
			<Fragment>
				<CompactCard>
					<header className="gsuite-purchase-cta__add-google-apps-card-header">
						<h3 className="gsuite-purchase-cta__add-google-apps-card-product-logo">
							{ /* Intentionally not translated */ }
							<strong>G Suite</strong>
							{ this.getPlanText() }
						</h3>
					</header>
				</CompactCard>

				<CompactCard>
					<div className="gsuite-purchase-cta__add-google-apps-card-product-details">
						<div className="gsuite-purchase-cta__add-google-apps-card-description">
							<h2 className="gsuite-purchase-cta__add-google-apps-card-title">
								{ translate( 'Professional email and so much more.' ) }
							</h2>

							<p className="gsuite-purchase-cta__add-google-apps-card-sub-title">
								{ translate(
									"We've partnered with Google to offer you email, " +
										'storage, docs, calendars, and more integrated with your site.'
								) }
							</p>

							<div className="gsuite-purchase-cta__add-google-apps-card-price">
								<h4 className="gsuite-purchase-cta__add-google-apps-card-price-per-user">
									<span>
										{ translate( '{{strong}}%(price)s{{/strong}} per user / month', {
											components: {
												strong: <strong />,
											},
											args: {
												price: monthlyPrice,
											},
										} ) }
									</span>
								</h4>

								{ upgradeAvailable && (
									<Button type="button" onClick={ this.goToAddGoogleApps }>
										{ translate( 'Add G Suite' ) }
									</Button>
								) }

								<h5 className="gsuite-purchase-cta__add-google-apps-card-billing-period">
									{ translate( '%(price)s billed yearly (2 months free!)', {
										args: {
											price: annualPrice,
										},
									} ) }
								</h5>
							</div>
						</div>

						<div className="gsuite-purchase-cta__add-google-apps-card-logos">
							<img alt="G Suite Logo" src="/calypso/images/g-suite/g-suite.svg" />
						</div>
					</div>
				</CompactCard>

				<CompactCard>
					<div className="gsuite-purchase-cta__add-google-apps-card-features">
						<div className="gsuite-purchase-cta__add-google-apps-card-feature">
							<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
								<img alt="Gmail Logo" src="/calypso/images/g-suite/logo_gmail_48dp.svg" />
							</div>
							<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
								<h5 className="gsuite-purchase-cta__add-google-apps-card-feature-header">
									{ translate( 'Gmail for @%(domain)s', {
										args: {
											domain: domainName,
										},
									} ) }
								</h5>
								<p>
									{ translate( 'Professional ad-free email that works with most email clients.' ) }
								</p>
							</div>
						</div>

						<div className="gsuite-purchase-cta__add-google-apps-card-feature">
							<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
								<img alt="Google Drive Logo" src="/calypso/images/g-suite/logo_drive_48dp.svg" />
							</div>
							<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
								<h5 className="gsuite-purchase-cta__add-google-apps-card-feature-header">
									{ translate( 'Keep all your files secure' ) }
								</h5>
								<p>{ this.getStorageText() }</p>
							</div>
						</div>

						<div className="gsuite-purchase-cta__add-google-apps-card-feature">
							<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
								<img alt="Google Docs Logo" src="/calypso/images/g-suite/logo_docs_48dp.svg" />
							</div>
							<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
								<h5 className="gsuite-purchase-cta__add-google-apps-card-feature-header">
									{ translate( 'Docs, spreadsheets and forms' ) }
								</h5>
								<p>{ translate( 'Create and edit documents to get your work done faster.' ) }</p>
							</div>
						</div>

						<div className="gsuite-purchase-cta__add-google-apps-card-feature">
							<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
								<img
									alt="Google Hangouts Logo"
									src="/calypso/images/g-suite/logo_hangouts_48dp.svg"
								/>
							</div>
							<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
								<h5 className="gsuite-purchase-cta__add-google-apps-card-feature-header">
									{ translate( 'Connect with your team' ) }
								</h5>
								<p>
									{ translate(
										'Use text chats, voice calls, or video calls, with built in screen sharing'
									) }
								</p>
							</div>
						</div>
					</div>

					<div className="gsuite-purchase-cta__add-google-apps-card-secondary-button">
						{ upgradeAvailable && (
							<Button type="button" onClick={ this.goToAddGoogleApps }>
								{ translate( 'Add G Suite' ) }
							</Button>
						) }
					</div>

					<div className="gsuite-purchase-cta__add-google-apps-card-learn-more">
						<p>
							{ translate(
								'{{strong}}No setup or software required.{{/strong}} ' +
									'{{a}}Learn more about integrating G Suite with your site.{{/a}}',
								{
									components: {
										strong: <strong />,
										a: (
											<a
												className="gsuite-purchase-cta__add-google-apps-card-learn-more-link"
												href={ ADDING_GOOGLE_APPS_TO_YOUR_SITE }
												target="_blank"
												rel="noopener noreferrer"
												onClick={ this.handleLearnMoreClick }
											/>
										),
									},
								}
							) }
						</p>
					</div>
				</CompactCard>
			</Fragment>
		);
	}

	render() {
		return (
			<EmailVerificationGate
				noticeText={ this.props.translate( 'You must verify your email to purchase G Suite.' ) }
				noticeStatus="is-info"
			>
				{ this.renderCta() }
			</EmailVerificationGate>
		);
	}
}

const learnMoreClick = domainName =>
	composeAnalytics(
		recordTracksEvent( 'calypso_domain_management_gsuite_learn_more_click', {
			domain_name: domainName,
		} ),
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Learn more" G Suite link in Email',
			'Domain Name',
			domainName
		)
	);

GSuitePurchaseCta.propTypes = {
	currencyCode: PropTypes.string.isRequired,
	domainName: PropTypes.string.isRequired,
	product: PropTypes.object.isRequired,
	selectedDomainName: PropTypes.string,
	selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
};

export default connect(
	( state, { selectedDomainName, selectedSite } ) => {
		const domains = getDomainsBySiteId( state, selectedSite.ID );
		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			domainName: getEligibleDomain( selectedDomainName, domains ),
		};
	},
	{ learnMoreClick }
)( localize( GSuitePurchaseCta ) );
