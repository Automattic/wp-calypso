import { WordPressLogo } from '@automattic/components';
import { useState } from '@wordpress/element';
import { Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { UpgradePlanHostingDetailsList, UpgradePlanHostingTestimonials } from './constants';
import { UpgradePlanHostingDetailsTooltip } from './upgrade-plan-hosting-details-tooltip';

export const UpgradePlanHostingDetails = () => {
	const { __ } = useI18n();
	const [ activeTooltipId, setActiveTooltipId ] = useState( '' );

	return (
		<div className="import__upgrade-plan-hosting-details">
			<div className="import__upgrade-plan-hosting-details-header">
				<p className="import__upgrade-plan-hosting-details-header-main">
					{ __( 'Why you should host with us' ) }
				</p>
				<p className="import__upgrade-plan-hosting-details-header-subtext">
					{ __( 'Our performance vs. our top 3 competitors' ) }
				</p>
			</div>
			<div className="import__upgrade-plan-hosting-details-list">
				<ul>
					{ UpgradePlanHostingDetailsList.map( ( { title, description, icon }, i ) => (
						<li key={ i }>
							<Icon
								className="import__upgrade-plan-hosting-details-list-icon"
								icon={ icon }
								size={ 24 }
							/>
							<div className="import__upgrade-plan-hosting-details-list-stats">
								<strong>{ title }</strong>
								<span>{ description }</span>
							</div>
						</li>
					) ) }
				</ul>
			</div>
			<div className="import__upgrade-plan-hosting-details-testimonials-container">
				<p>{ __( '100% loved by our best customers' ) }</p>
				<div className="import__upgrade-plan-hosting-details-testimonials">
					{ UpgradePlanHostingTestimonials.map(
						( { customerName, customerTestimonial, customerInfo }, i ) => (
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
								<WordPressLogo
									className="import__upgrade-plan-hosting-details-testimonials-image"
									size={ 24 }
								/>
							</UpgradePlanHostingDetailsTooltip>
						)
					) }
				</div>
			</div>
		</div>
	);
};
