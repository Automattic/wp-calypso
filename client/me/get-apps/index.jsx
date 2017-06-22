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
import Illustration from 'components/illustration';

export const GetApps = ( { translate } ) => (
	<Main className="get-apps">
		<MeSidebarNavigation />
		<Illustration illustration={ 'empty-results' } />
		<SectionHeader label={ translate( 'WordPress Apps' ) } />
		<Card className="get-apps__desktop">
			<p>{ translate( 'Desktop App for Mac' ) }</p>
			<p>{ translate( 'A desktop app that gives WordPress a permanent home in your dock.' ) }</p>
			<p>{ translate( 'Requires Mac OS X 10.11+. Also available for Windows (7+), Linux (.tar.gz), Linux (.deb).' ) }</p>
		</Card>
		<Card className="get-apps__mobile">
			<p>{ translate( 'Mobile Apps' ) }</p>
			<p>{ translate( 'WordPress at your fingertips.' ) }</p>
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
