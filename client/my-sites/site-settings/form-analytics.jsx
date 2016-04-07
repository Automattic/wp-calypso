/**
 * External dependencies
 */
var React = require( 'react' ),
	notices = require( 'notices' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings' );

/**
 * Internal dependencies
 */
var formBase = require( './form-base' ),
	productsValues = require( 'lib/products-values' ),
	protectForm = require( 'lib/mixins/protect-form' ),
	analytics = require( 'analytics' ),
	Card = require( 'components/card' ),
	Button = require( 'components/button' ),
	SectionHeader = require( 'components/section-header' );

module.exports = React.createClass( {

	displayName: 'SiteSettingsFormAnalytics',

	mixins: [ protectForm.mixin, formBase ],

	getInitialState: function() {
		return {
			isCodeValid: true
		};
	},

	resetState: function() {
		this.replaceState( {
			wga: {
				code: null
			},
			fetchingSettings: true
		} );
		debug( 'resetting state' );
	},

	getSettingsFromSite: function( siteInstance ) {
		var site = siteInstance || this.props.site,
			settings = {
				wga: {
					code: ''
				},
				fetchingSettings: site.fetchingSettings
			};

		if ( site.settings ) {
			debug( 'site settings fetched' );
			settings.wga = site.settings.wga;
		}

		return settings;
	},

	isCodeValid: function( code ) {
		return ! code || code.match( /^UA-\d+-\d+$/i );
	},

	handleCodeChange: function( event ) {
		var code = event.target.value,
			notice = this.state.notice,
			isCodeValid = this.isCodeValid( code );

		if ( ! isCodeValid && ! notice ) {
			notice = notices.error( this.translate( 'Invalid Google Analytics Tracking ID.' ) );
		} else if ( isCodeValid && notice ) {
			notices.removeNotice( notice );
			notice = null;
		}

		this.setState( {
			wga: {
				code: event.target.value
			},
			isCodeValid: isCodeValid,
			notice: notice
		} );
	},

	isSubmitButtonDisabled: function() {
		return this.state.fetchingSettings || this.state.submittingForm || ! this.state.isCodeValid;
	},

	onClickAnalyticsInput() {
		this.recordEvent( 'Clicked Analytics Key Field' );
	},

	onKeyPressAnalyticsInput() {
		this.recordEventOnce( 'typedAnalyticsKey', 'Typed In Analytics Key Field' );
	},

	form: function() {
		var placeholderText = '';

		if ( this.state.fetchingSettings ) {
			placeholderText = this.translate( 'Loading' );
		}
		return (
			<form id="site-settings" onSubmit={ this.submitForm } onChange={ this.markChanged }>
				<SectionHeader label={ this.translate( 'Analytics Settings' ) }>
					<Button
						primary
						compact
						disabled={ this.isSubmitButtonDisabled() }
						onClick={ this.submitForm }
						>
						{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				<Card className="analytics-settings">
					<fieldset>
						<label htmlFor="wgaCode">{ this.translate( 'Google Analytics Tracking ID', { context: 'site setting' } ) }</label>
						<input
							name="wgaCode"
							id="wgaCode"
							type="text"
							value={ this.state.wga.code }
							onChange={ this.handleCodeChange }
							placeholder={ placeholderText }
							disabled={ this.state.fetchingSettings || ! this.isEnabled() }
							onClick={ this.onClickAnalyticsInput }
							onKeyPress={ this.onKeyPressAnalyticsInput }
						/>
						<p className="settings-explanation"><a href="https://support.google.com/analytics/answer/1032385?hl=en" target="_blank">{
							this.translate( 'Where can I find my Tracking ID?' )
						}
						</a></p>
					</fieldset>
					<p>
						{ this.translate(
							'Google Analytics is a free service that complements our {{a}}built-in stats{{/a}} with different insights into your traffic.' +
							' WordPress.com stats and Google Analytics use different methods to identify and track activity on your site, so they will ' +
							'normally show slightly different totals for your visits, views, etc.',
							{
								components: {
									a: <a href={ '/stats/' + this.props.site.domain } />
								}
							}
						) }
					</p>
					<p>
					{ this.translate( 'Learn more about using {{a}}Google Analytics with WordPress.com{{/a}}.',
						{
							components: {
								a: <a href="http://en.support.wordpress.com/google-analytics/" target="_blank" />
							}
						}
					) }
					</p>
				</Card>
			</form>
		);
	},

	trackUpgradeClick: function() {
		analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', { cta_name: 'google_analytics' } );
	},

	isEnabled: function() {
		return productsValues.isBusiness( this.props.site.plan ) || productsValues.isEnterprise( this.props.site.plan );
	},

	render: function() {
		// we need to check that site has loaded first... a placeholder would be better,
		// but returning null is better than a fatal error for now
		if ( ! this.props.site ) {
			return null;
		}
		// Only show Google Analytics for business users.
		return this.form();
	}
} );
