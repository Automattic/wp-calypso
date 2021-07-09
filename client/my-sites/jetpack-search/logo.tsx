/**
 * External dependencies
 */
import React, { ReactElement } from 'react';

/**
 * Asset dependencies
 */
import JetpackSearchSVG from 'calypso/assets/images/illustrations/jetpack-search.svg';

export default function JetpackSearchLogo(): ReactElement {
	return (
		<div className="jetpack-search__logo">
			<img src={ JetpackSearchSVG } alt="Search logo" />
		</div>
	);
}
