/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:security:2fa-app-chooser-item' );

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

class Security2faAppChooserItem extends React.Component {
	static displayName = 'Security2faAppChooserItem';

	state = {
		downloadCodeDisplayed: false,
	};

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	}

	onCodeToggle = event => {
		event.preventDefault();
		this.setState( { downloadCodeDisplayed: ! this.state.downloadCodeDisplayed } );
	};

	possiblyRenderDownloadQRCode = appURL => {
		var imgURL =
			'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=H|0&chl=' +
			encodeURIComponent( appURL );

		if ( ! this.state.downloadCodeDisplayed ) {
			return null;
		}

		return <img className="security-2fa-app-chooser-item__qrcode" src={ imgURL } />;
	};

	render() {
		return (
			<div>
				<p>
					{ this.props.translate(
						'You selected {{strong}}%(deviceName)s{{/strong}}. If you do not ' +
							'already have an authentication app on your smartphone, you will ' +
							'need to choose from one of the following options:',
						{
							args: {
								deviceName: this.props.app.deviceName,
							},
							components: {
								strong: <strong />,
							},
						}
					) }
				</p>
				<ul>
					<li>
						{ this.props.translate(
							'{{downloadLink}}Download %(appName)s to this device ' +
								'from %(appStoreName)s.{{/downloadLink}}',
							{
								args: {
									appName: this.props.app.appName,
									appStoreName: this.props.app.storeName,
								},
								components: {
									downloadLink: (
										<a
											href={ this.props.app.appURL }
											target="_blank"
											rel="noopener noreferrer"
											onClick={ function() {
												analytics.ga.recordEvent(
													'Me',
													'Clicked On 2fa Download ' + this.props.app.appName + ' Link'
												);
											}.bind( this ) }
										/>
									),
								},
							}
						) }
					</li>
					<li>
						{ this.props.translate( 'Search for %(appName)s on %(appStoreName)s.', {
							args: {
								appName: this.props.app.appName,
								appStoreName: this.props.app.storeName,
							},
						} ) }
					</li>
					<li>
						{ this.props.translate(
							'{{codeRevealAnchor}}Scan this code{{/codeRevealAnchor}} with your ' +
								'device to be directed to %(appName)s on %(appStoreName)s.',
							{
								args: {
									appName: this.props.app.appName,
									appStoreName: this.props.app.storeName,
								},
								components: {
									codeRevealAnchor: (
										<a
											href="#"
											onClick={ function( event ) {
												analytics.ga.recordEvent( 'Me', 'Clicked On 2fa Scan This Code Link' );
												this.onCodeToggle( event );
											}.bind( this ) }
										/>
									),
								},
							}
						) }
						{ this.possiblyRenderDownloadQRCode( this.props.app.appURL ) }
					</li>
				</ul>
			</div>
		);
	}
}

export default localize( Security2faAppChooserItem );
