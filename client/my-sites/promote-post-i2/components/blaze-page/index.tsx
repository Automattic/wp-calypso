import config from '@automattic/calypso-config';
import { Page } from '@wordpress/admin-ui';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import JetpackFooter from 'calypso/components/jetpack/jetpack-footer';
import JetpackLogo from 'calypso/components/jetpack-logo';

const isBlazePlugin = config.isEnabled( 'is_running_in_blaze_plugin' );

interface Props {
	actions?: React.ReactNode;
	children: React.ReactNode;
}

/**
 * The Blaze flavor of the Jetpack admin footer: the standalone Blaze Ads
 * plugin is labelled with its own name, every other surface says Jetpack.
 */
export function BlazeFooter() {
	const translate = useTranslate();

	return (
		<JetpackFooter
			name={ isBlazePlugin ? ( translate( 'Blaze Ads' ) as string ) : undefined }
			showLogo={ ! isBlazePlugin }
		/>
	);
}

/**
 * The shared Blaze admin page chrome: an admin-ui <Page> with the Blaze
 * header (logo + title + subtitle). The standalone Blaze Ads plugin shows
 * its own name and no logo, matching its admin menu label.
 */
export default function BlazePage( { actions, children }: Props ) {
	const translate = useTranslate();

	return (
		<Page
			className="promote-post-i2__page"
			visual={ isBlazePlugin ? undefined : <JetpackLogo size={ 24 } monochrome={ false } /> }
			title={ isBlazePlugin ? translate( 'Blaze Ads' ) : translate( 'Blaze' ) }
			subTitle={ translate( 'Promote your posts and pages across WordPress.com and Tumblr.' ) }
			showSidebarToggle={ false }
			actions={ actions }
		>
			{ children }
			<BlazeFooter />
		</Page>
	);
}
