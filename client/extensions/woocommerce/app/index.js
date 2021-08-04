import { useTranslate } from 'i18n-calypso';
import React from 'react';
import WooCommerceColophon from 'woocommerce/components/woocommerce-colophon';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

function App( props ) {
	const translate = useTranslate();

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<div className={ 'woocommerce' }>
			<PageViewTracker path={ props.analyticsPath } title={ props.analyticsTitle } />
			<DocumentHead title={ translate( 'Store' ) } />
			{ props.children }
			<WooCommerceColophon />
		</div>
	);
}

export default App;
