import { useTranslate } from 'i18n-calypso';
import React from 'react';
import './style.scss';
import DocumentHead from 'calypso/components/data/document-head';

type PerformanceProfilerDashboardProps = {
	domain: string;
};

export const PerformanceProfilerDashboard = ( props: PerformanceProfilerDashboardProps ) => {
	const translate = useTranslate();
	const { domain } = props;

	return (
		<div className="container">
			<DocumentHead title={ translate( 'Speed Test' ) } />

			<div className="top-section"> Top section - { domain } </div>
			<div className="dahsboard-content">Dashboard content</div>
		</div>
	);
};
