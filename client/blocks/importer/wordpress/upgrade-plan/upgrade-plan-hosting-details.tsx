import { useState } from '@wordpress/element';
import { Icon } from '@wordpress/icons';
import { useTranslate, numberFormat } from 'i18n-calypso';
import { UpgradePlanHostingTestimonials } from './constants';
import cwvtechReportJson from './cwvtech-report.json';
import { UpgradePlanHostingDetailsTooltip } from './upgrade-plan-hosting-details-tooltip';
import type { HostingDetailsItem } from './types';

interface Props {
	upgradePlanHostingDetailsList: Array< HostingDetailsItem >;
}

export const UpgradePlanHostingDetails: React.FC< Props > = ( {
	upgradePlanHostingDetailsList,
} ) => {
	const translate = useTranslate();
	const [ activeTooltipId, setActiveTooltipId ] = useState( '' );

	const hostingDetailsItems = upgradePlanHostingDetailsList.map(
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
					<p>
						{ translate( '%(percentage)s loved by our best customers', {
							args: {
								percentage: numberFormat( 1, {
									numberFormatOptions: { style: 'percent' },
								} ),
								comment: 'percentage like 100% loved',
							},
						} ) }
					</p>
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
