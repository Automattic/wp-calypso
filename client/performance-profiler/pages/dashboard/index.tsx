import { useTranslate } from 'i18n-calypso';
import React from 'react';
import './style.scss';
import DocumentHead from 'calypso/components/data/document-head';
import PerformanceProfilerHeader from 'calypso/performance-profiler/components/header';

type PerformanceProfilerDashboardProps = {
	url: string;
	tab: string;
};

export const PerformanceProfilerDashboard = ( props: PerformanceProfilerDashboardProps ) => {
	const translate = useTranslate();
	const { url, tab } = props;
	const [ activeTab, setActiveTab ] = React.useState( tab );

	const getOnTabChange = ( tab: string ) => {
		window.history.pushState( {}, '', `?url=${ url }&tab=${ tab }` );
		setActiveTab( tab );
	};

	return (
		<div className="container">
			<DocumentHead title={ translate( 'Speed Test' ) } />

			<div className="top-section">
				<PerformanceProfilerHeader
					url={ url }
					activeTab={ activeTab }
					onTabChange={ getOnTabChange }
				/>
			</div>
			<div className="dashboard-content">
				<div className="l-block-wrapper">Dashboard content { activeTab }</div>
			</div>
		</div>
	);
};
