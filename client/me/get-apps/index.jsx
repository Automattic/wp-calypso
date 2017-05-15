/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'me/sidebar-navigation';
import Main from 'components/main';
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

export const GetApps = ( { translate } ) => (
	<Main className="get-apps">
		<MeSidebarNavigation />
		<SectionHeader label={ translate( 'Desktop apps' ) } />
		<Card className="get-apps__desktop">

			<section className="get-apps__app">
				<div className="get-apps__app-icon">
					<img src="/calypso/images/me/get-apps-osx.svg" alt={ translate( 'Mac' ) } width="96" height="96" />
				</div>
				<p><strong>{ translate( 'Mac' ) }</strong><br />
				{ translate( 'Requires 10.11 or newer' ) }</p>
				<Button href="https://apps.wordpress.com/d/osx?ref=getapps">{ translate( 'Download', { context: 'verb' } ) }</Button>
			</section>

			<section className="get-apps__app">
				<div className="get-apps__app-icon">
					<img src="/calypso/images/me/get-apps-windows.svg" alt={ translate( 'Windows' ) } width="96" height="96" />
				</div>
				<p><strong>{ translate( 'Windows' ) }</strong><br />
				{ translate( 'Requires 7 or newer' ) }</p>
				<Button href="https://apps.wordpress.com/d/windows?ref=getapps">{ translate( 'Download' ) }</Button>
			</section>

			<section className="get-apps__app">
				<div className="get-apps__app-icon">
					<img src="/calypso/images/me/get-apps-linux.svg" alt={ translate( 'Linux' ) } width="96" height="96" />
				</div>
				<p><strong>{ translate( 'Linux' ) }</strong><br />
				{ translate( 'Choose your distribution' ) }</p>
				<Button href="https://apps.wordpress.com/d/linux?ref=getapps">
					{ translate( '.TAR.GZ' ) }
				</Button>
				<Button href="https://apps.wordpress.com/d/linux-deb?ref=getapps">
					{ translate( '.DEB' ) }
				</Button>
			</section>

		</Card>

		<SectionHeader label={ translate( 'Mobile apps' ) } />
		<Card className="get-apps__mobile">

			<section className="get-apps__app">
				<div className="get-apps__app-icon">
					<img src="/calypso/images/me/get-apps-ios.svg" alt={ translate( 'iOS' ) } width="96" height="96" />
				</div>
				<p><strong>{ translate( 'iOS' ) }</strong></p>
				<a href="https://itunes.apple.com/us/app/wordpress/id335703880?mt=8">
					<img
						src="/calypso/images/me/get-apps-app-store.png"
						alt={ translate( 'Get on the iOS App Store' ) }
					/>
				</a>
			</section>

			<section className="get-apps__app">
				<div className="get-apps__app-icon">
					<img src="/calypso/images/me/get-apps-android.svg" alt={ translate( 'Android' ) } width="96" height="96" />
				</div>
				<p><strong>{ translate( 'Android' ) }</strong></p>
				<a href="https://play.google.com/store/apps/details?id=org.wordpress.android">
					<img
						src="/calypso/images/me/get-apps-google-play.png"
						alt={ translate( 'Get on Google Play' ) }
					/>
				</a>
			</section>

		</Card>

	</Main>
);

GetApps.propTypes = {
	translate: PropTypes.func,
};

GetApps.defaultProps = {
	translate: identity,
};

export default localize( GetApps );
