/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import MeSidebarNavigation from 'me/sidebar-navigation';
import WritingPreferences from './writing-preferences';
import NotificationPreferences from './notification-preferences';
import ReleaseChannelPreferences from './release-channel-preferences';
import ProxyPreferences from './proxy-preferences';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const AppPreferences = ( { translate } ) => (
	<Main className="account">
		<DocumentHead title={ translate( 'App Preferences' ) } />

		<MeSidebarNavigation />
		<WritingPreferences />
		<NotificationPreferences />
		<ReleaseChannelPreferences />
		<ProxyPreferences />
	</Main>
);

AppPreferences.propTypes = {
	translate: PropTypes.func,
};

AppPreferences.defaultProps = {
	translate: identity,
};

export default localize( AppPreferences );
