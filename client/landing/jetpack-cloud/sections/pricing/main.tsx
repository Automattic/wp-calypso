/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Masterbar from './masterbar';

/**
 * Style dependencies
 */
import './style.scss';

const PricingPage = () => {
	return (
		<Main className="pricing" wideLayout>
			<DocumentHead title={ 'Pricing' } />
			<PageViewTracker path="/pricing" title="Pricing" />
			<Masterbar />

			<div
				style={ {
					border: '2px solid tomato',
					margin: '40px 0',
					height: '100vh',
					borderRadius: '5px',
					padding: '16px',
				} }
			>
				<h2>{ 'Welcome to the Pricing page' }</h2>
			</div>
		</Main>
	);
};

export default PricingPage;
