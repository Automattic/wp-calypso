import { useTranslate } from 'i18n-calypso';
import React from 'react';
import './style.scss';
import DocumentHead from 'calypso/components/data/document-head';
import { CoreWebVitalsDisplay } from '../../components/core-web-vitals-display';

type PerformanceProfilerDashboardProps = {
	url: string;
};

export const PerformanceProfilerDashboard = ( props: PerformanceProfilerDashboardProps ) => {
	const translate = useTranslate();
	const { url } = props;

	return (
		<div className="container">
			<DocumentHead title={ translate( 'Speed Test' ) } />
			<div className="top-section"> Top section - { url } </div>
			<div className="dahsboard-content">Dashboard content</div>
			<CoreWebVitalsDisplay />
		</div>
	);
};
