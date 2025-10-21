import { Badge } from '@automattic/ui';
import {
	Button,
	Card,
	CardBody,
	ExternalLink,
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { layout, swatch } from '@wordpress/icons';
import './domain-connection-verification.scss';
import { useHelpCenter } from '../../app/help-center';
import { siteOverviewRoute } from '../../app/router/sites';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import VerificationInProgressNextSteps from './verification-in-progress-next-steps';

import './style.scss';

interface DomainConnectionVerificationProps {
	domainName: string;
	siteSlug: string;
	status: 'verifying' | 'connected';
}

export default function DomainConnectionVerification( {
	domainName,
	siteSlug,
}: DomainConnectionVerificationProps ) {
	const { setShowHelpCenter } = useHelpCenter();

	return (
		<Card className="dashboard-domain-connection-verification">
			<CardBody>
				<VStack spacing={ 4 }>
					<HStack justify="flex-start">
						<Icon icon={ swatch } />
						<Text className="domain-connection-verification-title" size={ 10 }>
							{ domainName }
						</Text>
						<Badge intent="warning">Verifying</Badge>
					</HStack>
					<Notice variant="info">
						{ __(
							'We’re checking your DNS records. Most updates happen quickly, but some providers cache old settings for up to 72 hours.'
						) }
					</Notice>
					<Text size="medium" weight={ 500 }>
						{ __( 'While you wait' ) }
					</Text>
					<RouterLinkSummaryButton
						to={ siteOverviewRoute.fullPath }
						params={ { siteSlug } }
						title={ __( 'Customize your site' ) }
						description={ __(
							'While your domain name is connecting, you can still work on your site.'
						) }
						decoration={ <Icon icon={ layout } /> }
					/>
					<VerificationInProgressNextSteps />
					<Text size="medium" weight={ 500 }>
						{ __( 'Need help?' ) }
					</Text>
					<VStack spacing={ 2 }>
						<InlineSupportLink supportContext="map-domain-setup-instructions">
							{ __( 'Domain connection guide' ) }
						</InlineSupportLink>
						<ExternalLink href="https://godaddy.com" children={ __( 'Registrar instructions' ) } />
						<Button
							variant="link"
							onClick={ () => setShowHelpCenter( true ) }
							children={ __( 'Contact support' ) }
						/>
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
