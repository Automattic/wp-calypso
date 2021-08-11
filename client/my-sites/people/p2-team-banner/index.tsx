/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Banner from 'calypso/components/banner';

const P2TeamBanner: FunctionComponent = () => {
	return (
		<div>
			<pre>Before Banner</pre>
			{ /*For whatever reason, the banner below will not always render*/ }
			<Banner
				callToAction="Update"
				description="This is the description."
				disableHref
				showIcon
				title="Simple banner with description and call to action"
			/>
			<pre>After Banner</pre>
		</div>
	);
};

export default P2TeamBanner;
