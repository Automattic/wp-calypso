/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

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
			selectedDomainName = this.props.selectedSite.domain;

		const annualPrice = getAnnualPrice( price );
		const monthlyPrice = getMonthlyPrice( price );

		return (
			<div>
				<CompactCard>
					<header className="add-google-apps-card__header">
						<h3 className="add-google-apps-card__product-logo">
							{ /* Intentionally not translated */ }
							<strong>G Suite</strong>
						</h3>
					</header>
				</CompactCard>
				<CompactCard>
					<div className="add-google-apps-card__product-details">
						<div className="add-google-apps-card__description">
							<h2 className="add-google-apps-card__title">
								{ this.translate( 'Professional email and so much more.' ) }
							</h2>

							<p className="add-google-apps-card__sub-title">
								{
									this.translate(
										"We've partnered with Google to offer you email, " +
										'storage, docs, calendars, and more integrated with your site.'
									)
								}
							</p>

							<div className="add-google-apps-card__price">
								<h4 className="add-google-apps-card__price-per-user">
									<span>
										{
											this.translate(
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

								<h5 className="add-google-apps-card__billing-period">
									{
										this.translate( '%(price)s billed yearly (2 months free!)',
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

						<div className="add-google-apps-card__logos">
							<img src="/calypso/images/g-suite/logos-2x.png" width="262" height="209" />
						</div>
					</div>
				</CompactCard>
				<CompactCard>
					<div className="add-google-apps-card__features">
						<div className="add-google-apps-card__feature">
							<div className="add-google-apps-card__feature-block">
								<img src="/calypso/images/g-suite/logo_gmail_48dp.svg" />
							</div>
							<div className="add-google-apps-card__feature-block">
								<h5 className="add-google-apps-card__feature-header">
									{
										this.translate(
											'Gmail for @%(domain)s',
											{
												args: {
													domain: selectedDomainName
												}
											}
										)
									}
								</h5>
								<p>{ this.translate( 'Professional ad-free email that works with most email clients.' ) }</p>
							</div>
						</div>

						<div className="add-google-apps-card__feature">
							<div className="add-google-apps-card__feature-block">
								<img src="/calypso/images/g-suite/logo_drive_48dp.svg" />
							</div>
							<div className="add-google-apps-card__feature-block">
								<h5 className="add-google-apps-card__feature-header">
									{ this.translate( 'Keep all your files secure' ) }
								</h5>
								<p>{ this.translate( 'Get 30GB of storage for all your files synced across devices.' ) }</p>
							</div>
						</div>

						<div className="add-google-apps-card__feature">
							<div className="add-google-apps-card__feature-block">
								<img src="/calypso/images/g-suite/logo_docs_48dp.svg" />
							</div>
							<div className="add-google-apps-card__feature-block">
								<h5 className="add-google-apps-card__feature-header">
									{ this.translate( 'Docs, spreadsheets and forms' ) }
								</h5>
								<p>{ this.translate( 'Create and edit documents to get your work done faster.' ) }</p>
							</div>
						</div>

						<div className="add-google-apps-card__feature">
							<div className="add-google-apps-card__feature-block">
								<img src="/calypso/images/g-suite/logo_sheets_48dp.svg" />
							</div>
							<div className="add-google-apps-card__feature-block">
								<h5 className="add-google-apps-card__feature-header">
									{ this.translate( 'Connect with your team' ) }
								</h5>
								<p>{ this.translate( 'Use text chats, voice calls, or video calls, with built in screen sharing' ) }</p>
							</div>
						</div>
					</div>

					<div className="add-google-apps-card__secondary-button">
						{ this.renderAddGoogleAppsButton() }
					</div>

					<div className="add-google-apps-card__learn-more">
						<p>
							{
								this.translate(
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
		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return null;
		}

		return (
			<Button
				type="button"
				onClick={ this.goToAddGoogleApps }>
				{ this.translate( 'Add G Suite' ) }
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

module.exports = AddGoogleAppsCard;
