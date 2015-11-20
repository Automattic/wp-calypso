/**
 * External dependencies
 */
var React = require( 'react' ),
	observe = require( 'lib/mixins/data-observe' );

/**
 * Internal dependencies
 */
var MeSidebarNavigation = require( 'me/sidebar-navigation' ),
	Main = require( 'components/main' ),
	CompactCard = require( 'components/card/compact' ),
	SecuritySectionNav = require( 'me/security-section-nav' ),
	ReauthRequired = require( 'me/reauth-required' ),
	twoStepAuthorization = require( 'lib/two-step-authorization' ),
	RecoveryEmail = require( './recovery-email' ),
	RecoveryPhone = require( './recovery-phone' );

module.exports = React.createClass( {
	displayName: 'SecurityCheckup',

	mixins: [ observe( 'userSettings' ) ],

	componentDidMount: function() {
		this.props.userSettings.getSettings();
	},

	render: function() {
		return (
			<Main className="security-checkup">
				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<CompactCard className="security-checkup-intro">
					<p className="security-checkup-intro__text">
						{ this.translate( 'Keep your account safe by adding a backup email address and phone number. If you ever have problems accessing your account, WordPress.com will use what you enter here to verify your identity.' ) }
					</p>
				</CompactCard>

				<CompactCard>
					<RecoveryEmail userSettings={ this.props.userSettings } />
				</CompactCard>

				<CompactCard>
					<RecoveryPhone userSettings={ this.props.userSettings } />
				</CompactCard>

			</Main>
		);
	}
} );
