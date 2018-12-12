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
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import config from 'config';
import { domainManagementAddGoogleApps } from 'my-sites/domains/paths';
import { getAnnualPrice, getMonthlyPrice } from 'lib/google-apps';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';

class AddGoogleAppsCard extends React.Component {
	constructor( props ) {
		super( props );
	}

	renderAddGoogleAppsButton() {
		const { translate } = this.props;

		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return null;
		}

		return (
			<Button type="button" onClick={ this.goToAddGoogleApps }>
				{ translate( 'Add G Suite' ) }
			</Button>
		);
	}

	handleLearnMoreClick = () => {
		this.props.learnMoreClick( this.props.selectedSite.domain || null );
	};

	goToAddGoogleApps = () => {
		page(
			domainManagementAddGoogleApps( this.props.selectedSite.slug, this.props.selectedSite.domain )
		);
	};

	render() {
		const { currencyCode, translate } = this.props,
			price = get( this.props, [ 'products', 'gapps', 'prices', currencyCode ], 0 ),
			googleAppsSupportUrl = ADDING_GOOGLE_APPS_TO_YOUR_SITE,
			selectedDomainName = this.props.selectedSite.domain;

		const annualPrice = getAnnualPrice( price, currencyCode );
		const monthlyPrice = getMonthlyPrice( price, currencyCode );

		return (
			<Fragment>
				<CompactCard>
					<header className="email__add-google-apps-card-header">
						<h3 className="email__add-google-apps-card-product-logo">
							{ /* Intentionally not translated */ }
							<strong>G Suite</strong>
						</h3>
					</header>
				</CompactCard>
				<CompactCard>
					<div className="email__add-google-apps-card-product-details">
						<div className="email__add-google-apps-card-description">
							<h2 className="email__add-google-apps-card-title">
								{ translate( 'Professional email and so much more.' ) }
							</h2>

							<p className="email__add-google-apps-card-sub-title">
								{ translate(
									"We've partnered with Google to offer you email, " +
										'storage, docs, calendars, and more integrated with your site.'
								) }
							</p>

							<div className="email__add-google-apps-card-price">
								<h4 className="email__add-google-apps-card-price-per-user">
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

								{ this.renderAddGoogleAppsButton() }

								<h5 className="email__add-google-apps-card-billing-period">
									{ translate( '%(price)s billed yearly (2 months free!)', {
										args: {
											price: annualPrice,
										},
									} ) }
								</h5>
							</div>
						</div>

						<div className="email__add-google-apps-card-logos">
							<img alt="G Suite Logo" src="/calypso/images/g-suite/g-suite.svg" />
						</div>
					</div>
				</CompactCard>
				<CompactCard>
					<div className="email__add-google-apps-card-features">
						<div className="email__add-google-apps-card-feature">
							<div className="email__add-google-apps-card-feature-block">
								<img alt="Gmail Logo" src="/calypso/images/g-suite/logo_gmail_48dp.svg" />
							</div>
							<div className="email__add-google-apps-card-feature-block">
								<h5 className="email__add-google-apps-card-feature-header">
									{ translate( 'Gmail for @%(domain)s', {
										args: {
											domain: selectedDomainName,
										},
									} ) }
								</h5>
								<p>
									{ translate( 'Professional ad-free email that works with most email clients.' ) }
								</p>
							</div>
						</div>

						<div className="email__add-google-apps-card-feature">
							<div className="email__add-google-apps-card-feature-block">
								<img alt="Google Drive Logo" src="/calypso/images/g-suite/logo_drive_48dp.svg" />
							</div>
							<div className="email__add-google-apps-card-feature-block">
								<h5 className="email__add-google-apps-card-feature-header">
									{ translate( 'Keep all your files secure' ) }
								</h5>
								<p>
									{ translate( 'Get 30GB of storage for all your files synced across devices.' ) }
								</p>
							</div>
						</div>

						<div className="email__add-google-apps-card-feature">
							<div className="email__add-google-apps-card-feature-block">
								<img alt="Google Docs Logo" src="/calypso/images/g-suite/logo_docs_48dp.svg" />
							</div>
							<div className="email__add-google-apps-card-feature-block">
								<h5 className="email__add-google-apps-card-feature-header">
									{ translate( 'Docs, spreadsheets and forms' ) }
								</h5>
								<p>{ translate( 'Create and edit documents to get your work done faster.' ) }</p>
							</div>
						</div>

						<div className="email__add-google-apps-card-feature">
							<div className="email__add-google-apps-card-feature-block">
								<img
									alt="Google Hangouts Logo"
									src="/calypso/images/g-suite/logo_hangouts_48dp.svg"
								/>
							</div>
							<div className="email__add-google-apps-card-feature-block">
								<h5 className="email__add-google-apps-card-feature-header">
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

					<div className="email__add-google-apps-card-secondary-button">
						{ this.renderAddGoogleAppsButton() }
					</div>

					<div className="email__add-google-apps-card-learn-more">
						<p>
							{ translate(
								'{{strong}}No setup or software required.{{/strong}} ' +
									'{{a}}Learn more about integrating G Suite with your site.{{/a}}',
								{
									components: {
										strong: <strong />,
										a: (
											<a
												href={ googleAppsSupportUrl }
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
}

AddGoogleAppsCard.propTypes = {
	products: PropTypes.object.isRequired,
	selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
};

const learnMoreClick = domainName =>
	composeAnalytics(
		recordTracksEvent( 'calypso_domain_management_email_learn_more_click', {
			domain_name: domainName,
		} ),
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Learn more" Google Apps link in Email',
			'Domain Name',
			domainName
		)
	);

export default connect(
	state => ( {
		currencyCode: getCurrentUserCurrencyCode( state ),
	} ),
	{ learnMoreClick }
)( localize( AddGoogleAppsCard ) );
