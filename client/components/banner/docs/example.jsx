/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Banner from 'calypso/components/banner';

const BannerExample = () => (
	<div>
		<Banner disableHref title="A simple banner" />
		<Banner
			callToAction="Update"
			description="This is the description."
			disableHref
			showIcon
			title="Simple banner with description and call to action"
		/>
		<Banner showIcon={ false } title="Banner with showIcon set to false" />
		<Banner
			callToAction="Backup"
			description="New plugins can lead to unexpected changes. Ensure you can restore your site if something goes wrong."
			dismissPreferenceName="devdocs-banner-backups-example"
			dismissTemporary
			horizontal
			href="#"
			jetpack
			title="A Jetpack banner with a call to action"
		/>
	</div>
);

BannerExample.displayName = 'Banner';

export default BannerExample;
