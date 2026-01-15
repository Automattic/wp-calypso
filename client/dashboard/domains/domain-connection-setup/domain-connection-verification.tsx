import { Domain, DomainConnectionSetupMode } from '@automattic/api-core';
import { Badge } from '@automattic/ui';
import {
	ExternalLink,
	Icon,
	Button,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { layout, swatch, atSymbol, published } from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import { siteDomainsRoute, siteOverviewRoute } from '../../app/router/sites';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import DnsPropagationProgressBar from './components/dns-propagation-progress-bar';
import DnsRecordsTable from './components/dns-records-table';
import DomainPropagationStatus from './components/domain-propagation-status';
import { isMappingVerificationSuccess } from './utils';
import VerificationInProgressNextSteps from './verification-in-progress-next-steps';
import type { DomainMappingSetupInfo, DomainMappingStatus } from '@automattic/api-core';

type DomainConnectionStatus = 'connected' | 'verifying';

interface DomainConnectionVerificationProps {
	domainData: Domain;
	domainName: string;
	siteSlug: string;
	domainConnectionSetupInfo: DomainMappingSetupInfo;
	domainMappingStatus: DomainMappingStatus;
	onRestartConnection: () => void;
	isRestartingConnection: boolean;
}

export default function DomainConnectionVerification( {
	domainData,
	domainName,
	siteSlug,
	domainMappingStatus,
	domainConnectionSetupInfo,
	onRestartConnection,
	isRestartingConnection,
}: DomainConnectionVerificationProps ) {
	const { name: appName } = useAppContext();
	const status: DomainConnectionStatus = isMappingVerificationSuccess(
		domainMappingStatus.mode,
		domainMappingStatus
	)
		? 'connected'
		: 'verifying';

	const hasCloudflareIpAddresses = domainMappingStatus.has_cloudflare_ip_addresses;

	const connectedAndCanBeSetAsPrimary =
		status === 'connected' && ! domainData.primary_domain && domainData.can_set_as_primary;

	return (
		<Card
			className={ `dashboard-domain-connection-verification dashboard-domain-connection-verification--${ status }` }
		>
			<CardBody>
				<VStack spacing={ 7 }>
					<HStack justify="flex-start">
						<Icon
							className="dashboard-domain-connection-verification__icon"
							icon={ status === 'verifying' ? swatch : published }
						/>
						<Text className="dashboard-domain-connection-verification__title" size={ 10 }>
							{ domainName }
						</Text>
						<Badge intent={ status === 'connected' ? 'success' : 'warning' }>
							{ status === 'connected' ? __( 'Active' ) : __( 'Verifying' ) }
						</Badge>
					</HStack>

					<DnsPropagationProgressBar
						domainMappingStatus={ domainMappingStatus }
						domainConnectionSetupInfo={ domainConnectionSetupInfo }
					/>

					{ status === 'verifying' && (
						<Notice variant="info">
							{ hasCloudflareIpAddresses
								? createInterpolateElement(
										__(
											'<domainName/> is using Cloudflare, which hides DNS records, so we can’t verify them the usual way. We’ll still confirm that your domain name points to <appName/>.com. Please check that your <cloudflare/> DNS settings include the required records.'
										),
										{
											domainName: <>{ domainName }</>,
											appName: <>{ appName }</>,
											cloudflare: (
												<ExternalLink href="https://www.cloudflare.com/">Cloudflare</ExternalLink>
											),
										}
								  )
								: __(
										'We’re checking your DNS records. Most updates happen quickly, but some providers cache old settings for up to 72 hours.'
								  ) }
						</Notice>
					) }

					<VStack spacing={ 4 }>
						{ ! hasCloudflareIpAddresses && (
							<Text size="medium" weight={ 500 }>
								{ domainMappingStatus.mode === DomainConnectionSetupMode.SUGGESTED
									? __( 'Name server verification' )
									: __( 'DNS record verification' ) }
							</Text>
						) }

						{ ! hasCloudflareIpAddresses && (
							<DnsRecordsTable
								domainName={ domainName }
								domainConnectionStatus={ domainMappingStatus }
								domainConnectionSetupInfo={ domainConnectionSetupInfo }
							/>
						) }
						{ hasCloudflareIpAddresses && domainMappingStatus.resolves_to_wpcom && (
							<Notice variant="info">
								{ createInterpolateElement(
									__(
										'<domainName/> appears to be set up with Cloudflare and it resolves to <appName/>.'
									),
									{
										domainName: <>{ domainName }</>,
										appName: <>{ appName }</>,
									}
								) }
							</Notice>
						) }
					</VStack>

					<DomainPropagationStatus domainName={ domainName } />

					<VStack spacing={ 4 }>
						{ status === 'verifying' && (
							<Text size="medium" weight={ 500 }>
								{ __( 'While you wait' ) }
							</Text>
						) }

						{ connectedAndCanBeSetAsPrimary && (
							<>
								<Text size="medium" weight={ 500 }>
									{ __( 'Recommended' ) }
								</Text>
								<RouterLinkSummaryButton
									to={ siteDomainsRoute.fullPath }
									params={ { siteSlug } }
									/* Translators: %s is the domain name. */
									title={ sprintf( __( 'Set %s as your primary site address' ), domainName ) }
									description={ __( 'It’s the URL visitors see in their browser’s address bar.' ) }
									decoration={ <Icon icon={ atSymbol } /> }
								/>
							</>
						) }
						<RouterLinkSummaryButton
							to={ siteOverviewRoute.fullPath }
							params={ { siteSlug } }
							title={ __( 'Customize your site' ) }
							description={ __(
								'While your domain name is connecting, you can still work on your site.'
							) }
							decoration={ <Icon icon={ layout } /> }
						/>
					</VStack>
					{ status === 'verifying' && <VerificationInProgressNextSteps /> }

					<VStack spacing={ 4 }>
						<Text size="medium" weight={ 500 }>
							{ __( 'Need help?' ) }
						</Text>
						<VStack spacing={ 2 }>
							<HStack>
								<Button
									variant="link"
									onClick={ onRestartConnection }
									isBusy={ isRestartingConnection }
									disabled={ isRestartingConnection }
									style={ { lineHeight: '20px' } }
								>
									{ __( 'Restart connection' ) }
								</Button>
							</HStack>
							<InlineSupportLink supportContext="map-domain-setup-instructions">
								{ __( 'Domain connection guide' ) }
							</InlineSupportLink>
							<InlineSupportLink supportContext="general-support-options">
								{ __( 'Contact support' ) }
							</InlineSupportLink>
							<InlineSupportLink supportContext="transfer-domain-registrar-login">
								{ __( 'Registrar instructions' ) }
							</InlineSupportLink>
						</VStack>
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
