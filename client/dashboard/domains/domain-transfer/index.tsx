import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { domainQuery } from '../../app/queries/domain';
import { domainRoute } from '../../app/router/domains';
import { ActionList } from '../../components/action-list';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { DomainSubtype } from '../../data/domains';
import { formatDate } from '../../utils/datetime';

export function getTopLevelOfTld( domainName: string ): string {
	return domainName.substring( domainName.lastIndexOf( '.' ) + 1 );
}

export default function DomainOverview() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const locale = useLocale();

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

	const renderInternalTransferOptions = () => {
		const actions = [];
		if ( ! domain.is_domain_only_site && domain.can_transfer_to_any_user ) {
			const description =
				domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION
					? __( 'Transfer this domain connection to any administrator on this site' )
					: __( 'Transfer this domain to any administrator on this site' );
			actions.push(
				<ActionList.ActionItem
					key="transfer-to-another-user"
					title={ __( 'Transfer to another user' ) }
					description={ description }
					actions={
						<RouterLinkButton
							variant="secondary"
							size="compact"
							to={ `/domains/${ domain.domain }/transfer/other-user` }
						>
							{ __( 'Continue' ) }
						</RouterLinkButton>
					}
				/>
			);
		} else if (
			! [ 'uk', 'fr', 'ca', 'de', 'jp' ].includes( getTopLevelOfTld( domain.domain ) ) &&
			domain.can_transfer_to_other_site
		) {
			actions.push(
				<ActionList.ActionItem
					key="transfer-to-any-use"
					title={ __( 'To another WordPress.com user' ) }
					description={ __( 'Transfer this domain to another WordPress.com user' ) }
					actions={
						<RouterLinkButton
							variant="secondary"
							size="compact"
							to={ `/domains/${ domain.domain }/transfer/any-user` }
						>
							{ __( 'Continue' ) }
						</RouterLinkButton>
					}
				/>
			);
		}
		if ( domain.can_transfer_to_other_site ) {
			const description =
				domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION
					? __( 'Transfer this domain connection to any site you are an administrator on' )
					: __( 'Transfer this domain to any site you are an administrator on' );
			actions.push(
				<ActionList.ActionItem
					key="transfer-to-another-site"
					title={ __( 'To another WordPress.com siter' ) }
					description={ description }
					actions={
						<RouterLinkButton
							variant="secondary"
							size="compact"
							to={ `/domains/${ domain.domain }/transfer/other-site` }
						>
							{ __( 'Continue' ) }
						</RouterLinkButton>
					}
				/>
			);
		}
		if ( actions.length > 0 ) {
			return <ActionList>{ actions }</ActionList>;
		}
	};

	const renderTransferMessage = () => {
		const registrationDate = new Date( domain.registration_date );
		const today = new Date();
		const registrationDatePlus60Days = new Date(
			registrationDate.getTime() + 60 * 24 * 60 * 60 * 1000
		);

		let message: string | React.ReactElement = __( 'This domain cannot be locked.' );

		if ( domain.domain_locking_available ) {
			message = __(
				'We recommend leaving the transfer lock on, unless you want to transfer your domain to another provider.'
			);
		}

		const supportLink =
			today > registrationDatePlus60Days
				? 'domain-designated-agent'
				: 'transfer-domain-registration';

		if ( domain.transfer_away_eligible_at ) {
			const transferAwayEligibleAt = formatDate(
				new Date( domain.transfer_away_eligible_at ),
				locale
			);

			message = createInterpolateElement(
				// translators: <date> is a date string, <link> is a link to the support page
				__( 'You can unlock this domain after <date/>. <link>Why is my domain locked?</link>' ),
				{
					date: <>{ transferAwayEligibleAt }</>,
					link: <InlineSupportLink supportContext={ supportLink } />,
				}
			);
		}

		return <Text>{ message }</Text>;
	};

	const renderTransferLock = () => {
		return <HStack>Transfer Lock placeholder</HStack>;
	};

	const renderCommonTldTransferOptions = () => {
		return (
			<>
				{ renderTransferMessage() }
				{ renderTransferLock() }
			</>
		);
	};

	const renderUkTransferOptions = () => {
		return <div>UK transfer options</div>;
	};

	const renderExternalTransferOptions = () => {
		const topLevelOfTld = getTopLevelOfTld( domain.domain );

		return (
			<Card>
				<CardBody>
					<VStack spacing={ 2 }>
						<SectionHeader title={ __( 'Transfer to another registrar' ) } level={ 3 } />
						{ domain.is_gravatar_restricted_domain && (
							<Text>
								{ __(
									'This domain is provided at no cost for the first year for use with your Gravatar profile. This offer is limited to one free domain per user. If you transfer this domain to another registrar, you will have to pay the standard price to register another domain for your Gravatar profile.'
								) }
							</Text>
						) }
						{ topLevelOfTld !== 'uk'
							? renderCommonTldTransferOptions()
							: renderUkTransferOptions() }
					</VStack>
				</CardBody>
			</Card>
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
			{ isDomainTransferable && <>{ renderInternalTransferOptions() }</> }
			{ isDomainTransferable && domain.subtype.id !== DomainSubtype.DOMAIN_CONNECTION && (
				<>{ renderExternalTransferOptions() }</>
			) }
		</PageLayout>
	);
}
