/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:security:2fa-app-chooser-item' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' );

module.exports = React.createClass( {

	displayName: 'Security2faAppChooserItem',

	getInitialState: function() {
		return {
			downloadCodeDisplayed: false
		};
	},

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	onCodeToggle: function( event ) {
		event.preventDefault();
		this.setState( { downloadCodeDisplayed: ! this.state.downloadCodeDisplayed } );
	},

	possiblyRenderDownloadQRCode: function( appURL ) {
		var imgURL = 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=H|0&chl=' + encodeURIComponent( appURL );

		if ( ! this.state.downloadCodeDisplayed ) {
			return null;
		}

		return (
			<img
				className="security-2fa-app-chooser-item__qrcode"
				src={ imgURL }
			/>
		);
	},

	render: function() {
		return (
			<div>
				<p>
					{ this.translate(
						'You selected {{strong}}%(deviceName)s{{/strong}}. If you do not ' +
						'already have an authentication app on your smartphone, you will ' +
						'need to choose from one of the following options:',
						{
							args: {
								deviceName: this.props.app.deviceName
							},
							components: {
								strong: <strong/>
							}
						}
					) }
				</p>
				<ul>
					<li>
						{ this.translate(
							'{{downloadLink}}Download %(appName)s to this device ' +
							'from %(appStoreName)s.{{/downloadLink}}',
							{
								args: {
									appName: this.props.app.appName,
									appStoreName: this.props.app.storeName
								},
								components: {
									downloadLink: <a
										href={ this.props.app.appURL }
										target="_blank"
										rel="noopener noreferrer"
										onClick={ function() {
											analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Download ' + this.props.app.appName + ' Link' );
										}.bind( this ) }
									/>
								}
							}
						) }
					</li>
					<li>
						{ this.translate(
							'Search for %(appName)s on %(appStoreName)s.',
							{
								args: {
									appName: this.props.app.appName,
									appStoreName: this.props.app.storeName
								}
							}
						) }
					</li>
					<li>
						{ this.translate(
							'{{codeRevealAnchor}}Scan this code{{/codeRevealAnchor}} with your ' +
							'device to be directed to %(appName)s on %(appStoreName)s.',
							{
								args: {
									appName: this.props.app.appName,
									appStoreName: this.props.app.storeName
								},
								components: {
									codeRevealAnchor: <a
										href="#"
										onClick={ function( event ) {
											analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Scan This Code Link' );
											this.onCodeToggle( event );
										}.bind( this ) }
									/>
								}
							}
						) }
						{ this.possiblyRenderDownloadQRCode( this.props.app.appURL ) }
					</li>
				</ul>
			</div>
		);
	}
} );
