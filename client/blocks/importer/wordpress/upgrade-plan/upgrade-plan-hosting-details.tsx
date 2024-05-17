import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useState } from '@wordpress/element';
import { hasTranslation } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import useHostingProviderName from 'calypso/site-profiler/hooks/use-hosting-provider-name';
import { useUpgradePlanHostingDetailsList, UpgradePlanHostingTestimonials } from './constants';
import { UpgradePlanHostingDetailsTooltip } from './upgrade-plan-hosting-details-tooltip';

export const UpgradePlanHostingDetails = () => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const [ activeTooltipId, setActiveTooltipId ] = useState( '' );
	const importSiteQueryParam = getQueryArg( window.location.href, 'from' )?.toString() || '';
	let importSiteHostName = '';

	try {
		importSiteHostName = new URL( importSiteQueryParam )?.hostname;
	} catch ( e ) {}

	const headerMainText =
		hasTranslation( 'Why should you host with us?' ) || isEnglishLocale
			? translate( 'Why should you host with us?' )
			: translate( 'Why you should host with us?' );
	const upgradePlanHostingDetailsList = useUpgradePlanHostingDetailsList();

	const { data: urlData } = useAnalyzeUrlQuery( importSiteQueryParam, true );

	const { data: hostingProviderData } = useHostingProviderQuery( importSiteHostName, true );
	const hostingProviderName = useHostingProviderName(
		hostingProviderData?.hosting_provider,
		urlData
	);

	const shouldDisplayHostIdentificationMessage =
		hostingProviderName &&
		hostingProviderName !== 'Unknown' &&
		hostingProviderName !== 'WordPress.com';

	return (
		<div className="import__upgrade-plan-hosting-details">
			<div className="import__upgrade-plan-hosting-details-card-container">
				<div className="import__upgrade-plan-hosting-details-header">
					<p className="import__upgrade-plan-hosting-details-header-main">{ headerMainText }</p>
					<p className="import__upgrade-plan-hosting-details-header-subtext">
						{ translate( 'Check our performance, compared to the average WordPress host' ) }
					</p>
				</div>
				<div className="import__upgrade-plan-hosting-details-list">
					<ul>
						{ upgradePlanHostingDetailsList.map( ( { title, description, icon }, i ) => (
							<li key={ i }>
								<Icon
									className="import__upgrade-plan-hosting-details-list-icon"
									icon={ icon }
									size={ 24 }
								/>
								<div className="import__upgrade-plan-hosting-details-list-stats">
									<p className="import__upgrade-plan-hosting-details-list-stats-title">{ title }</p>
									<span className="import__upgrade-plan-hosting-details-list-stats-description">
										{ description }
									</span>
								</div>
							</li>
						) ) }
					</ul>
				</div>
				{ isEnglishLocale && (
					<div className="import__upgrade-plan-hosting-details-testimonials-container">
						<p>{ translate( '100% loved by our best customers' ) }</p>
						<div className="import__upgrade-plan-hosting-details-testimonials">
							{ UpgradePlanHostingTestimonials.map(
								( { customerName, customerTestimonial, customerInfo, customerImage }, i ) => (
									<UpgradePlanHostingDetailsTooltip
										key={ i }
										id={ `testimonial-${ i }` }
										setActiveTooltipId={ setActiveTooltipId }
										activeTooltipId={ activeTooltipId }
										customerName={ customerName }
										customerInfo={ customerInfo }
										customerTestimonial={ customerTestimonial }
										hideArrow={ false }
									>
										<img
											className="import__upgrade-plan-hosting-details-testimonials-image"
											src={ customerImage }
											alt={ customerName }
										/>
									</UpgradePlanHostingDetailsTooltip>
								)
							) }
						</div>
					</div>
				) }
			</div>
			<div className="import__upgrade-plan-hosting-details-identified-host">
				{ shouldDisplayHostIdentificationMessage &&
					translate( "We've identified %(hostingProviderName)s as your host.", {
						args: { hostingProviderName },
					} ) }
			</div>
		</div>
	);
};
