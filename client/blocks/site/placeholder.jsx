/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

const SitePlaceholder = () => (
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	<div className="site is-loading">
		<div className="site__content">
			<div className="site-icon" />
			<div className="site__info">
				<div className="site__title">This is an example</div>
				<div className="site__domain">example.wordpress.com</div>
			</div>
		</div>
	</div>
	/* eslint-enable wpcalypso/jsx-classname-namespace */
);

export default SitePlaceholder;
