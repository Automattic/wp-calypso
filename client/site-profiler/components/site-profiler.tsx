import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { useDomainAnalyzerQuery } from 'calypso/data/site-profiler/use-domain-analyzer-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { LayoutBlock, LayoutBlockSection } from 'calypso/site-profiler/components/layout';
import useDefineConversionAction from 'calypso/site-profiler/hooks/use-define-conversion-action';
import useDomainQueryParam from 'calypso/site-profiler/hooks/use-domain-query-param';
import { errorNotice } from 'calypso/state/notices/actions';
import { useDelayedQueryTime } from '../hooks/use-delayed-query-time';
import DomainAnalyzer from './domain-analyzer';
import DomainInformation from './domain-information';
import HeadingInformation from './heading-information';
import HostingInformation from './hosting-information';
import HostingIntro from './hosting-intro';
import './styles.scss';

export default function SiteProfiler() {
	const location = useLocation();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const queryParams = useQuery();
	const { domain, isValid: isDomainValid } = useDomainQueryParam();
	const noticeOptions = { duration: 3000 };

	const {
		data: siteProfilerData,
		isFetching: isFetchingSP,
		isError: isErrorSP,
		errorUpdateCount: errorUpdateCountSP,
	} = useDomainAnalyzerQuery( domain, isDomainValid );
	const isBusyForWhile = useDelayedQueryTime( domain, isFetchingSP );
	const { data: hostingProviderData } = useHostingProviderQuery( domain, isDomainValid );
	const conversionAction = useDefineConversionAction(
		domain,
		siteProfilerData?.whois,
		siteProfilerData?.is_domain_available,
		hostingProviderData?.hosting_provider
	);

	// Handle errors from the domain analyzer query
	useEffect( () => {
		if ( ! isErrorSP ) {
			return;
		}

		dispatch(
			errorNotice(
				translate( 'There was problem analyzing provided domain. Please try again.' ),
				noticeOptions
			)
		);
	}, [ errorUpdateCountSP ] );

	const updateDomainQueryParam = ( value: string ) => {
		// Update the domain query param;
		// URL param is the source of truth
		value ? queryParams.set( 'domain', value ) : queryParams.delete( 'domain' );

		navigate( location.pathname + '?' + queryParams.toString() );
	};

	return (
		<>
			{ ! siteProfilerData && (
				<LayoutBlock className="domain-analyzer-block" width="medium">
					<DocumentHead title={ translate( 'Site Profiler' ) } />
					<DomainAnalyzer
						domain={ domain }
						isDomainValid={ isDomainValid }
						onFormSubmit={ updateDomainQueryParam }
						isBusy={ isFetchingSP }
						isBusyForWhile={ isBusyForWhile }
					/>
				</LayoutBlock>
			) }

			{ siteProfilerData && (
				<LayoutBlock className="domain-result-block">
					{
						// Translators: %s is the domain name searched
						<DocumentHead title={ translate( '%s ‹ Site Profiler', { args: [ domain ] } ) } />
					}
					{ siteProfilerData && (
						<LayoutBlockSection>
							<HeadingInformation
								domain={ domain }
								conversionAction={ conversionAction }
								onCheckAnotherSite={ () => updateDomainQueryParam( '' ) }
							/>
						</LayoutBlockSection>
					) }
					{ ! siteProfilerData.is_domain_available && (
						<>
							{ siteProfilerData && (
								<LayoutBlockSection>
									<HostingInformation
										dns={ siteProfilerData.dns }
										hostingProvider={ hostingProviderData?.hosting_provider }
									/>
								</LayoutBlockSection>
							) }
							{ siteProfilerData?.whois && (
								<LayoutBlockSection>
									<DomainInformation domain={ domain } whois={ siteProfilerData.whois } />
								</LayoutBlockSection>
							) }
						</>
					) }
				</LayoutBlock>
			) }

			<LayoutBlock isMonoBg={ !! siteProfilerData }>
				<HostingIntro />
			</LayoutBlock>
		</>
	);
}
