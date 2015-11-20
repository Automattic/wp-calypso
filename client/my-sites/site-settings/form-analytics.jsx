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
	config = require( 'config' ),
	protectForm = require( 'lib/mixins/protect-form' ),
	EmptyContent = require( 'components/empty-content' ),
	analytics = require( 'analytics' );

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

	form: function() {
		var placeholderText = '';

		if ( this.state.fetchingSettings ) {
			placeholderText = this.translate( 'Loading' );
		}
		return (
			<form id="site-settings" onSubmit={ this.submitForm } onChange={ this.markChanged }>
				<fieldset>
					<label htmlFor="wgaCode">{ this.translate( 'Google Analytics Tracking ID', { context: 'site setting' } ) }</label>
					<input
						name="wgaCode"
						id="wgaCode"
						type="text"
						value={ this.state.wga.code }
						onChange={this.handleCodeChange}
						placeholder={ placeholderText }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Analytics Key Field' ) }
						onKeyPress={ this.recordEventOnce.bind( this, 'typedAnalyticsKey', 'Typed In Analytics Key Field' ) }
					/>
					<p className="settings-explanation"><a href="https://support.google.com/analytics/answer/1032385?hl=en" target="_blank">{
						this.translate( 'Where to find my code?' )
					}
					</a></p>
				</fieldset>
				<p>{
					this.translate( 'Google Analytics is a free service that complements our {{a}}built-in stats{{/a}} with different insights into your traffic. WordPress.com stats and Google Analytics use different methods to identify and track activity on your site, so they will normally show slightly different totals for your visits, views, etc.', {
					components: {
						a: <a href={ '/stats/' + this.props.site.domain } />
					} } )
				}</p>
				<p>{
					this.translate( 'Learn more about using {{a}}Google Analytics with WordPress.com{{/a}}.', {
					components: {
						a: <a href="http://en.support.wordpress.com/google-analytics/" target="_blank" />
					} } )
				}</p>
				<button
					type="submit"
					className="button is-primary"
					disabled={ this.isSubmitButtonDisabled() }
				>
					{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' ) }
				</button>
			</form>
		);
	},

	upgradePrompt: function() {
		var plansLink = '/plans/';

		if ( config.isEnabled( 'manage/plans' ) ) {
			plansLink += this.props.site.domain;
		} else {
			plansLink += this.props.site.ID;
		}

		return (
			<EmptyContent
				illustration="/calypso/images/drake/drake-whoops.svg"
				title={ this.translate( 'Want to use Google Analytics on your site?', { context: 'site setting upgrade' } ) }
				line={ this.translate( 'Support for Google Analytics is now available with WordPress.com Business.', { context: 'site setting upgrade' } ) }
				action={ this.translate( 'Upgrade Now', { context: 'site setting upgrade' } ) }
				actionURL={ plansLink }
				isCompact={ true }
				actionCallback={ this.trackUpgradeClick }
			/>
		);
	},

	trackUpgradeClick: function() {
		analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', { cta_name: 'google_analytics' } );
	},

	render: function() {
		// we need to check that site has loaded first... a placeholder would be better,
		// but returning null is better than a fatal error for now
		if ( ! this.props.site ) {
			return null;
		}
		// Only show Google Analytics for business users.
		if ( productsValues.isBusiness( this.props.site.plan ) || productsValues.isEnterprise( this.props.site.plan )) {
			return this.form();
		} else {
			return this.upgradePrompt();
		}
	}
} );
