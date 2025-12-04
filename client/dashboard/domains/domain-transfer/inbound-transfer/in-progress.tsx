import { domainInboundTransferStatusQuery } from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import { Icon, __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { drafts, layout } from '@wordpress/icons';
import { siteOverviewRoute } from '../../../app/router/sites';
import Notice from '../../../components/notice';
import RouterLinkSummaryButton from '../../../components/router-link-summary-button';
import { Text } from '../../../components/text';
import { InboundTransferStep } from './transfer-step';

export const InboundTransferInProgress = ( {
	domainName,
	siteSlug,
}: {
	domainName: string;
	siteSlug: string;
} ) => {
	const { data: domainInboundTransferStatus } = useQuery(
		domainInboundTransferStatusQuery( domainName )
	);

	return (
		<InboundTransferStep
			icon={ <Icon size={ 24 } icon={ drafts } /> }
			title={ domainName }
			badge={ <Badge intent="warning">{ __( 'In progress' ) }</Badge> }
			subtitle={ __( 'Estimated: 5–7 days' ) }
			progress={ { currentStep: 2, color: 'var(--wp-admin-theme-color)' } }
		>
			<VStack spacing={ 8 }>
				<Notice>
					{ __(
						'Domain name transfers typically take 5–7 days. We’ll email you when it’s ready.'
					) }
				</Notice>
				<VStack spacing={ 4 }>
					<Text size="large" weight={ 500 }>
						{ __( 'Transfer in progress' ) }
					</Text>
					<Text>
						{ sprintf(
							// translators: %(domainName)s is the domain name, %(registrar)s is the domain name provider
							__(
								'%(domainName)s is on its way. You may be able to speed up the transfer by approving the email %(registrar)s sent you. Besides that, there’s nothing you need to do—we’ll email you when it’s complete.'
							),
							{
								domainName,
								registrar:
									domainInboundTransferStatus?.registrar ?? __( 'your domain name provider' ),
							}
						) }
					</Text>
				</VStack>
				<VStack spacing={ 4 }>
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
				</VStack>
			</VStack>
		</InboundTransferStep>
	);
};
