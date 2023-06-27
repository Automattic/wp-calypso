import { ConfettiAnimation } from '@automattic/components';
import { ThemeProvider } from '@emotion/react';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import theme from 'calypso/my-sites/marketplace/theme';
import { useThankYouData } from './data/use-thank-you-data';
import GoBackSection from './go-back-section';

import './style.scss';

const ThankYouRedesignI2 = () => {
	const { title, subtitle } = useThankYouData();
	return (
		<ThemeProvider theme={ theme }>
			<PageViewTracker path="/test/marketplace/thank-you/:site" title="Checkout > Thank you" />
			<GoBackSection />

			<div className="thank-you-redesign-i2">
				<ConfettiAnimation delay={ 1000 } />
				<div className="thank-you-redesign-i2__header">
					<h1 className="thank-you-redesign-i2__title wp-brand-font">{ title }</h1>
					<p className="thank-you-redesign-i2__subtitle">{ subtitle }</p>
				</div>
			</div>
		</ThemeProvider>
	);
};

export default ThankYouRedesignI2;
