/**
 * External dependencies
 */
const React = require( 'react' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
const Button = require( 'components/forms/form-button' ),
	CompactCard = require( 'components/card/compact' ),
	config = require( 'config' ),
	paths = require( 'my-sites/upgrades/paths' ),
	support = require( 'lib/url/support' ),
	analyticsMixin = require( 'lib/mixins/analytics' );

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
			googleAppsSupportUrl = support.ADDING_GOOGLE_APPS_TO_YOUR_SITE;
		let price = gapps && gapps.cost_display;

		// Gapps price is stored annually but we'd like to show a monthly price
		price = price.replace( /(\d+\.?\d+)/, ( val ) => {
			const number = ( Math.round( parseFloat( val ) / 10 * 100 ) / 100 );
			return number % 1 === 0 ? number : number.toFixed( 2 );
		} );

		return (
			<CompactCard className="add-google-apps-card">
				<header className="add-google-apps-card__header">
					<h3 className="add-google-apps-card__product-logo">
						{ /* Intentionally not translated */ }
						<strong>Google</strong>
						<span>Apps for Work</span>
					</h3>

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
												price: price
											}
										}
									)
								}
							</span>
						</h4>

						<span className="add-google-apps-card__price-separator"> | </span>

						<h5 className="add-google-apps-card__billing-period">
							{ this.translate( 'Billed yearly — get 2 months free!' ) }
						</h5>
					</div>

					{ this.renderAddGoogleAppsButton() }
				</header>

				<div className="add-google-apps-card__product-details">
					<div className="add-google-apps-card__description">
						<h2 className="add-google-apps-card__title">
							{ this.translate( 'Professional Email & More' ) }
						</h2>

						<p>
							{
								this.translate(
									'{{strong}}No setup or software required.{{/strong}} ' +
									'Professional email, online storage, shared calendars, ' +
									'video meetings, and more. {{a}}Learn more.{{/a}}',
									{
										components: {
											strong: <strong />,
											a: (
												<a href={ googleAppsSupportUrl }
													target="_blank"
													onClick={ this.handleLearnMoreClick } />
											)
										}
									}
								)
							}
						</p>
					</div>

					<div className="add-google-apps-card__features">
						<h5 className="add-google-apps-card__professional-email">
							<span className="noticon noticon-checkmark"></span>
							{
								this.translate(
									'{{strong}}Professional{{/strong}} Email Address',
									{
										components: {
											strong: <strong />
										}
									}
								)
							}
						</h5>

						<h5 className="add-google-apps-card__file-storage">
							<span className="noticon noticon-checkmark"></span>
							{
								this.translate(
									'{{strong}}30GB{{/strong}} Online File Storage',
									{
										components: {
											strong: <strong />
										}
									}
								)
							}
						</h5>

						<h5 className="add-google-apps-card__professional-email">
							<span className="noticon noticon-checkmark"></span>
							{
								this.translate(
									'{{strong1}}Video{{/strong1}} Meetings {{a}}and {{strong2}}More!{{/strong2}}{{/a}}',
									{
										components: {
											strong1: <strong />,
											strong2: <strong />,
											a: (
												<a href={ googleAppsSupportUrl }
													target="_blank"
													onClick={ this.handleAndMoreClick } />
											)
										}
									}
								)
							}
						</h5>
					</div>

					{ this.renderAddGoogleAppsButton() }
				</div>
			</CompactCard>
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
				{ this.translate( 'Add Google Apps' ) }
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
