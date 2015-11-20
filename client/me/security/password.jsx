/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:security:password' );

/**
 * Internal dependencies
 */
var MeSidebarNavigation = require( 'me/sidebar-navigation' ),
	Card = require( 'components/card' ),
	AccountPassword = require( 'me/account-password' ),
	ReauthRequired = require( 'me/reauth-required' ),
	twoStepAuthorization = require( 'lib/two-step-authorization' ),
	SecuritySectionNav = require( 'me/security-section-nav' ),
	Main = require( 'components/main' );

module.exports = React.createClass( {

	displayName: 'Security',

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component is unmounting.' );
	},

	render: function() {
		return (
			<Main className="security">
				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<Card className="me-security-settings">
					<p>
						{ this.translate(
							'To update your password enter a new one below. Your password should be at least six characters long. ' +
							'To make it stronger, use upper and lower case letters, numbers and symbols like ! " ? $ % ^ & ).'
						) }
					</p>

					<AccountPassword
						userSettings={ this.props.userSettings }
						accountPasswordData={ this.props.accountPasswordData }
					/>
				</Card>
			</Main>
		);
	}
} );
