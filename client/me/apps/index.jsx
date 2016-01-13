/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var MeSidebarNavigation = require( 'me/sidebar-navigation' ),
	Main = require( 'components/main' ),
	Button = require( 'components/button' ),
	Card = require( 'components/card' );

module.exports = React.createClass( {

	displayName: 'Apps',

	render: function() {
		return (
			<Main className="apps">
				<MeSidebarNavigation />

				<h1 className="apps__title">{ this.translate( 'Get Apps' ) }</h1>
				<p className="apps__subheading">{ this.translate( 'Manage all your WordPress.com and Jetpack-enabled sites in one place. On your desktop, or on the go.' ) }</p>

				<h2 className="form-section-heading">{ this.translate( 'Desktop apps' ) }</h2>
				<Card className="apps__desktop">

					<section className="apps__app">
						<div className="apps__app-icon">
						</div>
						<p><strong>Mac</strong><br />
						Requires 10.11 or newer</p>
						<Button href="https://desktop.wordpress.com/d/osx">{ this.translate( 'Download' ) }</Button>
					</section>

					<section className="apps__app">
						<div className="apps__app-icon">
						</div>
						<p><strong>Windows</strong><br />
						Requires 7 or newer</p>
						<Button href="https://desktop.wordpress.com/d/windows">{ this.translate( 'Download' ) }</Button>
					</section>

					<section className="apps__app">
						<div className="apps__app-icon">
						</div>
						<p><strong>Linux</strong><br />
						Choose your distribution</p>
						<Button href="https://desktop.wordpress.com/d/linux">{ this.translate( '.TAR.GZ' ) }</Button> <Button href="https://desktop.wordpress.com/d/linux-deb">{ this.translate( '.DEB' ) }</Button>
					</section>

				</Card>

				<h2 className="form-section-heading">{ this.translate( 'Mobile apps' ) }</h2>
				<Card className="apps__mobile">

					<section className="apps__app">
						<div className="apps__app-icon">
						</div>
						<p><strong>iOS</strong><br />
						Requires 9 or newer</p>
						<Button href="https://itunes.apple.com/us/app/wordpress/id335703880?mt=8">{ this.translate( 'Get' ) }</Button>
					</section>

					<section className="apps__app">
						<div className="apps__app-icon">
						</div>
						<p><strong>Android</strong><br />
						Requires 4 or newer</p>
						<Button href="https://play.google.com/store/apps/details?id=org.wordpress.android">{ this.translate( 'Get' ) }</Button>
					</section>

				</Card>

			</Main>
		);
	}
} );
