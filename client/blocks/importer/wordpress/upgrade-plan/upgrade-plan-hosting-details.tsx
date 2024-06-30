import { useState } from '@wordpress/element';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { UpgradePlanHostingTestimonials } from './constants';
import cwvtechReportJson from './cwvtech-report.json';
import { useUpgradePlanHostingDetailsList } from './hooks/use-get-upgrade-plan-hosting-details-list';
import { Skeleton } from './skeleton';
import { UpgradePlanHostingDetailsTooltip } from './upgrade-plan-hosting-details-tooltip';

export const UpgradePlanHostingDetails = () => {
	const translate = useTranslate();
	const [ activeTooltipId, setActiveTooltipId ] = useState( '' );
	const { list: upgradePlanHostingDetailsList, isFetching } = useUpgradePlanHostingDetailsList();

	let hostingDetailsItems = null;

	if ( isFetching ) {
		hostingDetailsItems = Array.from( { length: 3 } ).map( ( _, index ) => (
			<li key={ index } className="import__upgrade-plan-hosting-details-list-loading">
				<Skeleton width="60%" />
				<Skeleton height="15px" />
			</li>
		) );
	} else {
		hostingDetailsItems = upgradePlanHostingDetailsList.map(
			( { title, description, icon }, i ) => (
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
			)
		);
	}

	const boostPercentage = Math.round(
		( cwvtechReportJson[ 'WordPress.com' ].goodCWM - cwvtechReportJson[ 'WordPress' ].goodCWM ) *
			100
	);

	return (
		<div className="import__upgrade-plan-hosting-details">
			<div className="import__upgrade-plan-hosting-details-card-container">
				<div className="import__upgrade-plan-hosting-details-header">
					<p className="import__upgrade-plan-hosting-details-header-main">
						{ translate( 'Why should you host with us?' ) }
					</p>
					<p className="import__upgrade-plan-hosting-details-header-subtext">
						{ translate(
							'%(boostPercentage)d%% more WordPress.com sites have good Core Web Vitals when compared to any other WordPress host [Source: Google data].',
							{
								args: { boostPercentage },
							}
						) }
					</p>
				</div>
				<div className="import__upgrade-plan-hosting-details-list">
					<ul>{ hostingDetailsItems }</ul>
				</div>
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
			</div>
		</div>
	);
};
