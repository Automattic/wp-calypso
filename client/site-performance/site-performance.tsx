import page from '@automattic/calypso-router';
import { useDebouncedInput } from '@wordpress/compose';
import { translate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { PageSelector } from './components/PageSelector';
import { PerformanceReport } from './components/PerformanceReport';
import { DeviceTabControls, Tab } from './components/device-tab-control';
import { useSitePages } from './hooks/useSitePages';

import './style.scss';

export const SitePerformance = () => {
	const [ activeTab, setActiveTab ] = useState< Tab >( 'mobile' );

	const queryParams = useSelector( getCurrentQueryArguments );
	const [ , setQuery, query ] = useDebouncedInput();
	const pages = useSitePages( { query } );

	const currentPageId = queryParams?.page_id?.toString();

	const wpcom_performance_url = useMemo( () => {
		return pages.find( ( page ) => page.value === currentPageId )?.wpcom_performance_url;
	}, [ pages, currentPageId ] );

	return (
		<div className="site-performance">
			<div className="site-performance-device-tab-controls__container">
				<NavigationHeader
					className="site-performance__navigation-header"
					title={ translate( 'Performance' ) }
					subtitle={ translate(
						'Optimize your site for lightning-fast performance. {{link}}Learn more.{{/link}}',
						{
							components: {
								link: <InlineSupportLink supportContext="site-monitoring" showIcon={ false } />,
							},
						}
					) }
				/>
				<PageSelector
					onFilterValueChange={ setQuery }
					options={ pages }
					onChange={ ( page_id ) => {
						const url = new URL( window.location.href );

						if ( page_id ) {
							url.searchParams.set( 'page_id', page_id );
						} else {
							url.searchParams.delete( 'page_id' );
						}

						page.replace( url.pathname + url.search );
					} }
					value={ currentPageId }
				/>
				<DeviceTabControls onDeviceTabChange={ setActiveTab } value={ activeTab } />
			</div>
			<PerformanceReport wpcom_performance_url={ wpcom_performance_url } activeTab={ activeTab } />
		</div>
	);
};
