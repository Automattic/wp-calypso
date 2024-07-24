import { type Callback } from '@automattic/calypso-router';
import React from 'react';
import WPCloudSignupSidebar from 'calypso/a8c-for-hosts/components/sidebar-menu/wpcloud-signup';
import WPCloudSignup from 'calypso/a8c-for-hosts/sections/wpcloud-signup/wpcloud-signup';

export const wpcloudSignupContext: Callback = ( context, next ) => {
	context.secondary = <WPCloudSignupSidebar path={ context.path } />;
	context.primary = <WPCloudSignup />;

	next();
};
