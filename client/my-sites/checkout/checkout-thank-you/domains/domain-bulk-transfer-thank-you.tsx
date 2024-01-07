import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import { preventWidows } from 'calypso/lib/formatting';
import ThankYouLayout from '../redesign-v2/ThankYouLayout';

interface DomainBulkTransferThankYouProps {
	purchases: ReceiptPurchase[];
	currency: string;
}

const DomainBulkTransferThankYou: React.FC< DomainBulkTransferThankYouProps > = ( {
	purchases,
	currency,
} ) => {
	const { __, _n } = useI18n();

	const handleUserClick = ( destination: string ) => {
		recordTracksEvent( 'calypso_domain_transfer_complete_click', {
			destination,
		} );
	};

	const purchaseLabel = ( priceInteger: number ) => {
		if ( priceInteger === 0 ) {
			return __( 'We’ve paid for an extra year' );
		}

		const priceFormatted = formatCurrency( priceInteger, currency, {
			stripZeros: true,
			isSmallestUnit: true,
		} );

		return sprintf(
			/* translators: %1$s: price formatted */
			__( '%1$s for one year' ),
			priceFormatted
		);
	};

	const productsProps = purchases?.map( ( { meta, priceInteger } ) => {
		return {
			key: 'domain-' + meta,
			name: meta,
			actions: purchaseLabel( priceInteger ),
		};
	} );

	const purchaseDetailsProps = [
		{
			key: 'domain-essentials',
			title: translate( 'Dive into domain essentials' ),
			description: translate(
				'Check out our support documentation for step-by-step instructions and expert guidance on your domain set up.'
			),
			buttonText: translate( 'Master the domain basics' ),
			href: '/support/domains',
			onClick: () =>
				recordTracksEvent( 'calypso_domain_transfer_to_any_user_support_domains_click' ),
		},
		{
			key: 'domain-resources',
			title: translate( 'Your go-to domain resource' ),
			description: translate(
				'Dive into our comprehensive support documentation to learn the basics of domains, from registration to management.'
			),
			buttonText: translate( 'Domain support resources' ),
			href: '/support/domains',
			onClick: () =>
				recordTracksEvent( 'calypso_domain_transfer_to_any_user_support_domains_click' ),
		},
	];

	return (
		<ThankYouLayout
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
			buttons={
				<>
					<Button
						href="/setup/domain-transfer"
						onClick={ () => handleUserClick( '/setup/domain-transfer' ) }
						className="is-secondary"
					>
						{ __( 'Transfer more domains' ) }
					</Button>

					<Button
						href="/domains/manage"
						className="manage-all-domains"
						onClick={ () => handleUserClick( '/domains/manage' ) }
						variant="primary"
					>
						{ _n( 'Manage your domain', 'Manage your domains', purchases?.length ?? 0 ) }
					</Button>
				</>
			}
			productsProps={ productsProps }
			purchaseDetailsProps={ purchaseDetailsProps }
		/>
	);
};

export default DomainBulkTransferThankYou;
