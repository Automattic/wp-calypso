import { Badge, Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { A4A_WOOPAYMENTS_OVERVIEW_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import WooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/woopayments.svg';

type Props = {
	onDismiss: () => void;
	onClick: () => void;
};

const WooPaymentsFeaturedCard = ( { onDismiss, onClick }: Props ) => {
	const translate = useTranslate();

	return (
		<Card className="overview__featured-woopayments">
			<div className="overview__featured-woopayments-top">
				<Badge className="overview__featured-woopayments-badge">{ translate( 'Featured' ) }</Badge>

				<Button
					className="overview__featured-dismiss-button"
					variant="tertiary"
					icon={ close }
					onClick={ onDismiss }
				/>
			</div>

			<img
				className="overview__featured-woopayments-logo"
				src={ WooPaymentsLogo }
				alt="WooPayments"
			/>

			<div className="overview__featured-woopayments-content">
				<h3 className="overview__featured-woopayments-title">
					{ translate( 'Revenue share available' ) }
				</h3>

				<div className="overview__featured-woopayments-description">
					{ translate(
						"Accept credit/debit cards and local payment options with no setup or monthly fees. Earn revenue share on transactions from your clients' sites within Automattic for Agencies."
					) }
				</div>
			</div>

			<Button
				className="overview__featured-woopayments-button"
				variant="primary"
				__next40pxDefaultSize
				href={ A4A_WOOPAYMENTS_OVERVIEW_LINK }
				onClick={ onClick }
			>
				{ translate( 'View details and start earning' ) }
			</Button>
		</Card>
	);
};

export default WooPaymentsFeaturedCard;
