/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import * as React from 'react';
const AnchorError: React.FunctionComponent = () => {
	return (
		<div className="gutenboarding-page">
			Sorry, we were not able to locate that Anchor Podcast ID.{ ' ' }
			<a href="https://anchor.fm">Return to anchor.</a>
		</div>
	);
};
export default AnchorError;
