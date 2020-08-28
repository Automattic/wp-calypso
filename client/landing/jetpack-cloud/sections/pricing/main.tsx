/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';

/**
 * Style dependencies
 */
import './style.scss';

const PricingPage = () => {
	const translate = useTranslate();

	return (
		<Main className="pricing">
			<DocumentHead title={ translate( 'Pricing' ) } />
			<PageViewTracker path="/pricing" title="Pricing" />

			<div className="pricing__title">
				<h2>{ translate( 'Welcome to the Pricing page' ) }</h2>
			</div>
		</Main>
	);
};

export default PricingPage;
