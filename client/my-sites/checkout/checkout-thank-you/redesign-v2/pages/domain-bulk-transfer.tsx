import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { preventWidows } from 'calypso/lib/formatting';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';
import ThankYouDomainProduct from '../products/domain-product';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

interface DomainBulkTransferThankYouProps {
	purchases: ReceiptPurchase[];
	currency: string;
}

export default function DomainBulkTransferThankYou( {
	purchases,
	currency,
}: DomainBulkTransferThankYouProps ) {
	const { __, _n } = useI18n();

	const handleUserClick = ( destination: string ) => {
		recordTracksEvent( 'calypso_domain_transfer_complete_click', {
			destination,
		} );
	};

	const headerButtons = (
		<>
			<Button
				href="/setup/domain-transfer"
				onClick={ () => handleUserClick( '/setup/domain-transfer' ) }
				className="is-secondary"
			>
				{ __( 'Transfer more domains' ) }
			</Button>

			<Button
				href={ domainManagementRoot() }
				className="manage-all-domains"
				onClick={ () => handleUserClick( domainManagementRoot() ) }
				variant="primary"
			>
				{ _n( 'Manage your domain', 'Manage your domains', purchases?.length ?? 0 ) }
			</Button>
		</>
	);

	const products = purchases.map( ( purchase, index ) => {
		return <ThankYouDomainProduct purchase={ purchase } currency={ currency } key={ index } />;
	} );

	const footerDetails = [
		{
			key: 'footer-transfer-speed-up',
			title: translate( 'Want to speed this up?' ),
			description: translate(
				'Check your inbox for an email from your current domain provider for instructions on how to speed up the transfer process.'
			),
		},
		{
			key: 'footer-transfer-dns-records',
			title: translate( 'Will my email continue to work?' ),
			description: translate(
				"We'll automatically import any MX, TXT, and A records for your domain, so your email will transfer seamlessly."
			),
		},
	];

	usePresalesChat( 'wpcom' );

	return (
		<ThankYouV2
			title={ translate( 'Your domain transfer has started', 'Your domain transfers have started', {
				count: purchases.length,
			} ) }
			subtitle={
				<>
					<div>
						{ preventWidows(
							translate(
								"We've got it from here. Your domain is being transferred with no downtime.",
								"We've got it from here! Your domains are being transferred with no downtime.",
								{ count: purchases.length }
							)
						) }
					</div>
					<div>
						{ preventWidows(
							translate(
								"We'll send an email when your domain is ready to use.",
								"We'll send an email when your domains are ready to use.",
								{ count: purchases.length }
							)
						) }
					</div>
				</>
			}
			headerButtons={ headerButtons }
			products={ products }
			footerDetails={ footerDetails }
		/>
	);
}
