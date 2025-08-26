import { useSuspenseQuery } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { domainQuery } from '../../app/queries/domain';
// import { sitePurchaseQuery } from '../../app/queries/site-purchases';
import { domainRoute } from '../../app/router/domains';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function DomainOverview() {
	// const locale = useLocale();
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	// const { data: purchase } = useQuery(
	// 	sitePurchaseQuery( domain.blog_id, parseInt( domain.subscription_id, 10 ) )
	// );

	const renderTransferInfo = () => {
		return (
			<Notice title={ __( 'What are DNS records used for?' ) }>
				{ createInterpolateElement(
					__(
						'Transferring a domain within WordPress.com is immediate. However, transferring a domain to another provider can take 5–7 days during which no changes to the domain can be made. Read <link>Transfer a domain to another registrar</link> before starting a transfer.'
					),
					{
						link: <InlineSupportLink supportContext="transfer-domain-to-another-registrar" />,
					}
				) }
			</Notice>
		);
	};

	const isDomainTransferable =
		! domain.is_hundred_year_domain &&
		! domain.is_redeemable &&
		! ( domain.pending_registration || domain.pending_registration_at_registry ) &&
		! domain.aftermarket_auction &&
		domain.current_user_is_owner;

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Transfer' ) } /> }>
			{ renderTransferInfo() }
			{ isDomainTransferable && <>Domain is transferable</> }
		</PageLayout>
	);
}
