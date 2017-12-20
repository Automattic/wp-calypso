/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const placeholderContent = (
	<Main wideLayout>
		<div className="jetpack-connect__plans placeholder">
			<header className="formatted-header">
				<h1 className="formatted-header__title">
					<span className="placeholder-text">Your site is now connected!</span>
				</h1>
				<p className="formatted-header__subtitle">
					<span className="placeholder-text">Now pick a plan that's right for you.</span>
				</p>
			</header>
			<Card>
				<div className="jetpack-connect-plans-placeholder__plans-content" />
			</Card>
		</div>
	</Main>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

export default function PlansPlaceholder() {
	return placeholderContent;
}
