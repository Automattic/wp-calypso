/**
 * External dependencies
 */
var React = require('react');

/**
 * Internal dependencies
 */
var MeSidebarNavigation = require('me/sidebar-navigation'),
    Main = require('components/main'),
    Button = require('components/button'),
    Card = require('components/card');

module.exports = React.createClass({
    displayName: 'GetApps',

    render: function() {
        return (
            <Main className="get-apps">
                <MeSidebarNavigation />

                <h1 className="get-apps__title">{this.translate('Get Apps')}</h1>
                <p className="get-apps__subheading">
                    {this.translate(
                        'Manage all your WordPress.com and Jetpack-enabled sites in one place. On your desktop, or on the go.'
                    )}
                </p>

                <h2 className="form-section-heading">{this.translate('Desktop apps')}</h2>
                <Card className="get-apps__desktop">

                    <section className="get-apps__app">
                        <div className="get-apps__app-icon">
                            <img
                                src="/calypso/images/me/get-apps-osx.svg"
                                alt={this.translate('Mac')}
                                width="96"
                                height="96"
                            />
                        </div>
                        <p>
                            <strong>{this.translate('Mac')}</strong><br />
                            {this.translate('Requires 10.11 or newer')}
                        </p>
                        <Button href="https://apps.wordpress.com/d/osx?ref=getapps">
                            {this.translate('Download')}
                        </Button>
                    </section>

                    <section className="get-apps__app">
                        <div className="get-apps__app-icon">
                            <img
                                src="/calypso/images/me/get-apps-windows.svg"
                                alt={this.translate('Windows')}
                                width="96"
                                height="96"
                            />
                        </div>
                        <p>
                            <strong>{this.translate('Windows')}</strong><br />
                            {this.translate('Requires 7 or newer')}
                        </p>
                        <Button href="https://apps.wordpress.com/d/windows?ref=getapps">
                            {this.translate('Download')}
                        </Button>
                    </section>

                    <section className="get-apps__app">
                        <div className="get-apps__app-icon">
                            <img
                                src="/calypso/images/me/get-apps-linux.svg"
                                alt={this.translate('Linux')}
                                width="96"
                                height="96"
                            />
                        </div>
                        <p>
                            <strong>{this.translate('Linux')}</strong><br />
                            {this.translate('Choose your distribution')}
                        </p>
                        <Button href="https://apps.wordpress.com/d/linux?ref=getapps">
                            {this.translate('.TAR.GZ')}
                        </Button>
                        {' '}
                        <Button href="https://apps.wordpress.com/d/linux-deb?ref=getapps">
                            {this.translate('.DEB')}
                        </Button>
                    </section>

                </Card>

                <h2 className="form-section-heading">{this.translate('Mobile apps')}</h2>
                <Card className="get-apps__mobile">

                    <section className="get-apps__app">
                        <div className="get-apps__app-icon">
                            <img
                                src="/calypso/images/me/get-apps-ios.svg"
                                alt={this.translate('iOS')}
                                width="96"
                                height="96"
                            />
                        </div>
                        <p><strong>{this.translate('iOS')}</strong></p>
                        <a href="https://itunes.apple.com/us/app/wordpress/id335703880?mt=8">
                            <img
                                src="/calypso/images/me/get-apps-app-store.png"
                                alt={this.translate('Get on the iOS App Store')}
                            />
                        </a>
                    </section>

                    <section className="get-apps__app">
                        <div className="get-apps__app-icon">
                            <img
                                src="/calypso/images/me/get-apps-android.svg"
                                alt={this.translate('Android')}
                                width="96"
                                height="96"
                            />
                        </div>
                        <p><strong>{this.translate('Android')}</strong></p>
                        <a
                            href="https://play.google.com/store/apps/details?id=org.wordpress.android"
                        >
                            <img
                                src="/calypso/images/me/get-apps-google-play.png"
                                alt={this.translate('Get on Google Play')}
                            />
                        </a>
                    </section>

                </Card>

            </Main>
        );
    },
});
