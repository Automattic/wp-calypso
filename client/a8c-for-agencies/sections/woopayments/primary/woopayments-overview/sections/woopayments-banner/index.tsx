import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import ccImage from 'calypso/assets/images/a8c-for-agencies/woopayments/cc-image.webp';
import wooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/woopayments/logo.svg';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

type Props = {
	cta: ReactNode;
};

export default function WooPaymentsBanner( { cta }: Props ) {
	const translate = useTranslate();

	return (
		<PageSectionColumns className="woopayments-banner__section">
			<PageSectionColumns.Column>
				<div className="woopayments-banner__content">
					<img className="woopayments-banner__logo" src={ wooPaymentsLogo } alt="WooPayments" />
					<div>
						<div className="woopayments-banner__heading">
							{ translate( "Transform Your Clients' Success Into Real Agency Revenue" ) }
						</div>
						<div className="woopayments-banner__description">
							{ preventWidows(
								translate(
									"As an Automattic for Agencies partner, every WooPayments transaction creates new earning potential for your business. Unlock exclusive, built-in commissions just for helping your clients grow—whether you're onboarding new stores or deepening relationships with those you already support."
								)
							) }
						</div>
					</div>
					{ cta }
				</div>
			</PageSectionColumns.Column>
			<PageSectionColumns.Column alignCenter>
				<img src={ ccImage } alt="WooPayments" />
			</PageSectionColumns.Column>
		</PageSectionColumns>
	);
}
