import { useTranslate } from 'i18n-calypso';
type PaymentPlanProps = {
	isMultiSiteIncompatible?: boolean;
};
const PaymentPlan: React.FC< PaymentPlanProps > = ( { isMultiSiteIncompatible } ) => {
	const translate = useTranslate();

	return (
		<div className="product-lightbox__variants-plan">
			{ isMultiSiteIncompatible ? (
				<div className="product-lightbox__variants-plan-alt-info">
					<span className="product-lightbox__variants-plan-alt-info--dot"></span>
					<span className="product-lightbox__variants-plan-alt-info--text">
						{ translate( 'Not available for multisite WordPress installs' ) }
					</span>
				</div>
			) : (
				<>
					<p>Payment plan:</p>

					<div className="product-lightbox__variants-plan-card">
						<div className="product-lightbox__variants-grey-label">
							<span className="product-lightbox__variants-plan-card-price">{ '$4.95' }</span>
							<span className="product-lightbox__variants-plan-card-month-short">/mo</span>
							<span className="product-lightbox__variants-plan-card-month-long">/month</span>,
							billed yearly
						</div>
						<div className="product-lightbox__variants-grey-label">
							<span className="product-lightbox__variants-plan-card-old-price">{ '$9.95' }</span>
							59% off the first year
						</div>
					</div>
				</>
			) }
		</div>
	);
};
export default PaymentPlan;
