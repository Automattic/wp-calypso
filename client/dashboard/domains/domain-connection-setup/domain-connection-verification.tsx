import {
	DomainConnectionSetupMode,
	type Domain,
	type DomainMappingSetupInfo,
	type DomainMappingStatus,
} from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import {
	ExternalLink,
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { siteDomainsRoute, siteOverviewRoute } from '../../app/router/sites';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import DnsRecordsTable from './components/dns-records-table';
import DomainPropagationStatus from './components/domain-propagation-status';
import { getDomainConnectionStatus } from './utils';

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
	const status = getDomainConnectionStatus( domainMappingStatus.mode, domainMappingStatus );
	const hasCloudflareIpAddresses = domainMappingStatus.has_cloudflare_ip_addresses;
	const connectedAndCanBeSetAsPrimary =
		status === 'active' && ! domainData.primary_domain && domainData.can_set_as_primary;

	const workingOnSiteLink = <Link to={ siteOverviewRoute.fullPath } params={ { siteSlug } } />;

	const renderStatusMessage = () => {
		if ( status === 'active' ) {
			if ( connectedAndCanBeSetAsPrimary ) {
				return createInterpolateElement(
					__(
						'<domain/> is connected. To send visitors there, <primaryAddress>set it as your primary site address</primaryAddress>.'
					),
					{
						domain: <>{ domainName }</>,
						primaryAddress: <Link to={ siteDomainsRoute.fullPath } params={ { siteSlug } } />,
					}
				);
			}

			return sprintf(
				// translators: %s is the connected domain name
				__( '%s is connected and ready to use.' ),
				domainName
			);
		}

		if ( status === 'connecting' ) {
			return (
				<VStack spacing={ 2 }>
					<Text>
						{ createInterpolateElement(
							__(
								'<domain/> is being connected in the background. We’ll email you when it’s active so you can continue <site>working on your site</site>.'
							),
							{ domain: <>{ domainName }</>, site: workingOnSiteLink }
						) }
					</Text>
					<Text>
						{ __(
							'This usually takes a few hours, though in some cases it can take up to 72 hours.'
						) }
					</Text>
				</VStack>
			);
		}

		return (
			<VStack spacing={ 2 }>
				<Text>
					{ __(
						'This usually takes a few hours, though in some cases it can take up to 72 hours.'
					) }
				</Text>
				<Text>
					{ createInterpolateElement(
						__(
							'You can continue <site>working on your site</site> while we verify the connection.'
						),
						{ site: workingOnSiteLink }
					) }
				</Text>
			</VStack>
		);
	};

	return (
		<VStack
			spacing={ 6 }
			className={ `dashboard-domain-connection-verification dashboard-domain-connection-verification--${ status }` }
		>
			<Card className="dashboard-domain-connection-verification__status-card">
				<CardBody>
					<VStack spacing={ 1 }>
						<Text size="medium">{ domainName }</Text>
						<Text size="small">{ status === 'active' ? __( 'Active' ) : __( 'Verifying' ) }</Text>
					</VStack>
				</CardBody>
			</Card>

			<Card className="dashboard-domain-connection-verification__content-card">
				<CardBody>
					<VStack spacing={ 6 }>
						<VStack spacing={ 3 }>
							<Text size="medium" weight={ 500 }>
								{ status === 'active'
									? __( 'Your domain is connected' )
									: __( 'Your part is done. We’ll take it from here.' ) }
							</Text>
							{ renderStatusMessage() }
						</VStack>

						{ hasCloudflareIpAddresses && status !== 'active' && (
							<Notice variant="info">
								{ createInterpolateElement(
									__(
										'<domainName/> is using Cloudflare, which hides DNS records, so we can’t verify them the usual way. We’ll still confirm that your domain points to <appName/>.com. Please check that your <cloudflare/> DNS settings include the required records.'
									),
									{
										domainName: <>{ domainName }</>,
										appName: <>{ appName }</>,
										cloudflare: (
											<ExternalLink href="https://www.cloudflare.com/">Cloudflare</ExternalLink>
										),
									}
								) }
							</Notice>
						) }

						{ ! hasCloudflareIpAddresses && (
							<VStack spacing={ 4 }>
								<Text size="medium" weight={ 500 }>
									{ domainMappingStatus.mode === DomainConnectionSetupMode.SUGGESTED
										? __( 'Name server verification' )
										: __( 'DNS record verification' ) }
								</Text>
								<DnsRecordsTable
									domainName={ domainName }
									domainConnectionStatus={ domainMappingStatus }
									domainConnectionSetupInfo={ domainConnectionSetupInfo }
								/>
							</VStack>
						) }

						{ hasCloudflareIpAddresses && status === 'active' && (
							<Notice variant="info">
								{ createInterpolateElement(
									__( '<domainName/> is set up with Cloudflare and resolves to <appName/>.' ),
									{
										domainName: <>{ domainName }</>,
										appName: <>{ appName }</>,
									}
								) }
							</Notice>
						) }

						<DomainPropagationStatus domainName={ domainName } status={ status } />

						<VStack spacing={ 4 }>
							<Text size="medium" weight={ 500 }>
								{ __( 'Need help?' ) }
							</Text>
							<VStack spacing={ 2 }>
								<InlineSupportLink supportContext="map-domain-setup-instructions">
									{ __( 'Domain connection guide' ) }
								</InlineSupportLink>
								<InlineSupportLink supportContext="transfer-domain-registrar-login">
									{ __( 'Registrar instructions' ) }
								</InlineSupportLink>
								<InlineSupportLink supportContext="general-support-options">
									{ __( 'Contact support' ) }
								</InlineSupportLink>
								<Button
									variant="link"
									onClick={ onRestartConnection }
									isBusy={ isRestartingConnection }
									disabled={ isRestartingConnection }
								>
									{ __( 'Restart setup' ) }
								</Button>
							</VStack>
						</VStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
