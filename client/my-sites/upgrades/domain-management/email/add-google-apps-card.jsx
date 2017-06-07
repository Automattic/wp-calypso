/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import CompactCard from 'components/card/compact';
import config from 'config';
import paths from 'my-sites/upgrades/paths';
import support from 'lib/url/support';
import analyticsMixin from 'lib/mixins/analytics';
import { getAnnualPrice, getMonthlyPrice } from 'lib/google-apps';

const AddGoogleAppsCard = React.createClass( {
	propTypes: {
		products: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	mixins: [ analyticsMixin( 'domainManagement', 'email' ) ],

	render() {
		const gapps = this.props.products.gapps,
			googleAppsSupportUrl = support.ADDING_GOOGLE_APPS_TO_YOUR_SITE,
			price = gapps && gapps.cost_display,
			selectedDomainName = this.props.selectedSite.domain,
			{ translate } = this.props;

		const annualPrice = getAnnualPrice( price );
		const monthlyPrice = getMonthlyPrice( price );

		return (
			<div>
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
								{
									translate(
										"We've partnered with Google to offer you email, " +
										'storage, docs, calendars, and more integrated with your site.'
									)
								}
							</p>

							<div className="email__add-google-apps-card-price">
								<h4 className="email__add-google-apps-card-price-per-user">
									<span>
										{
											translate(
												'{{strong}}%(price)s{{/strong}} per user / month',
												{
													components: {
														strong: <strong />
													},
													args: {
														price: monthlyPrice
													}
												}
											)
										}
									</span>
								</h4>

								{ this.renderAddGoogleAppsButton() }

								<h5 className="email__add-google-apps-card-billing-period">
									{
										translate( '%(price)s billed yearly (2 months free!)',
											{
												args: {
													price: annualPrice
												}
											}
										)
									}
								</h5>
							</div>
						</div>

						<div className="email__add-google-apps-card-logos">
							<img src="/calypso/images/g-suite/logos-2x.png" width="262" height="209" />
						</div>
					</div>
				</CompactCard>
				<CompactCard>
					<div className="email__add-google-apps-card-features">
						<div className="email__add-google-apps-card-feature">
							<div className="email__add-google-apps-card-feature-block">
								<img src="/calypso/images/g-suite/logo_gmail_48dp.svg" />
							</div>
							<div className="email__add-google-apps-card-feature-block">
								<h5 className="email__add-google-apps-card-feature-header">
									{
										translate(
											'Gmail for @%(domain)s',
											{
												args: {
													domain: selectedDomainName
												}
											}
										)
									}
								</h5>
								<p>{ translate( 'Professional ad-free email that works with most email clients.' ) }</p>
							</div>
						</div>

						<div className="email__add-google-apps-card-feature">
							<div className="email__add-google-apps-card-feature-block">
								<img src="/calypso/images/g-suite/logo_drive_48dp.svg" />
							</div>
							<div className="email__add-google-apps-card-feature-block">
								<h5 className="email__add-google-apps-card-feature-header">
									{ translate( 'Keep all your files secure' ) }
								</h5>
								<p>{ translate( 'Get 30GB of storage for all your files synced across devices.' ) }</p>
							</div>
						</div>

						<div className="email__add-google-apps-card-feature">
							<div className="email__add-google-apps-card-feature-block">
								<img src="/calypso/images/g-suite/logo_docs_48dp.svg" />
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
								<img src="/calypso/images/g-suite/logo_hangouts_48dp.svg" />
							</div>
							<div className="email__add-google-apps-card-feature-block">
								<h5 className="email__add-google-apps-card-feature-header">
									{ translate( 'Connect with your team' ) }
								</h5>
								<p>{ translate( 'Use text chats, voice calls, or video calls, with built in screen sharing' ) }</p>
							</div>
						</div>
					</div>

					<div className="email__add-google-apps-card-secondary-button">
						{ this.renderAddGoogleAppsButton() }
					</div>

					<div className="email__add-google-apps-card-learn-more">
						<p>
							{
								translate(
									'{{strong}}No setup or software required.{{/strong}} ' +
									'{{a}}Learn more about integrating G Suite with your site.{{/a}}',
									{
										components: {
											strong: <strong />,
											a: (
												<a href={ googleAppsSupportUrl }
													target="_blank"
													rel="noopener noreferrer"
													onClick={ this.handleLearnMoreClick } />
											)
										}
									}
								)
							}
						</p>
					</div>
				</CompactCard>
			</div>
		);
	},

	renderAddGoogleAppsButton() {
		const { translate } = this.props;

		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return null;
		}

		return (
			<Button
				type="button"
				onClick={ this.goToAddGoogleApps }>
				{ translate( 'Add G Suite' ) }
			</Button>
		);
	},

	handleLearnMoreClick() {
		this.recordEvent( 'learnMoreClick', this.props.selectedDomainName || null );
	},

	handleAndMoreClick() {
		this.recordEvent( 'andMoreClick', this.props.selectedDomainName || null );
	},

	goToAddGoogleApps() {
		page( paths.domainManagementAddGoogleApps( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	}
} );

export default localize( AddGoogleAppsCard );
