import { Badge } from '@automattic/ui';
import { Icon, __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { published, globe, atSymbol, envelope } from '@wordpress/icons';
import { useAppContext } from '../../../app/context';
import { domainOverviewRoute } from '../../../app/router/domains';
import { siteOverviewRoute } from '../../../app/router/sites';
import RouterLinkSummaryButton from '../../../components/router-link-summary-button';
import { Text } from '../../../components/text';
import { InboundTransferStep } from './transfer-step';

export const InboundTransferComplete = ( {
	domainName,
	siteSlug,
}: {
	domainName: string;
	siteSlug: string;
} ) => {
	const { name: appName } = useAppContext();

	return (
		<InboundTransferStep
			icon={
				<Icon size={ 24 } icon={ published } fill="var(--dashboard__foreground-color-success)" />
			}
			title={ domainName }
			badge={ <Badge intent="success">{ __( 'Active' ) }</Badge> }
			progress={ { currentStep: 3, color: 'var(--wp-admin-theme-color)' } }
		>
			<VStack spacing={ 8 }>
				<VStack spacing={ 4 }>
					<Text size="large" weight={ 500 }>
						{ __( 'Transfer complete' ) }
					</Text>
					<Text>
						{ sprintf(
							// translators: %(domain)s is the domain name and %(appName)s is the app name
							__(
								"%(domain)s has been successfully transferred and is securely hosted at %(appName)s. It's ready to use, but we have a few recommendations to help it run smoothly."
							),
							{
								domain: domainName,
								appName,
							}
						) }
					</Text>
				</VStack>
				<VStack spacing={ 4 }>
					<Text size="medium" weight={ 500 }>
						{ __( 'Recommended' ) }
					</Text>
					<VStack spacing={ 3 }>
						<RouterLinkSummaryButton
							to={ siteOverviewRoute.fullPath }
							params={ { siteSlug } }
							// translators: %(domain)s is the domain name
							title={ sprintf( __( 'Point %(domain)s to your site' ), { domain: domainName } ) }
							// translators: %(domain)s is the domain name
							description={ sprintf( __( '%(domain)s is still pointing to an external site.' ), {
								domain: domainName,
							} ) }
							decoration={ <Icon icon={ globe } /> }
						/>
						<RouterLinkSummaryButton
							to={ domainOverviewRoute.fullPath }
							params={ { siteSlug, domainName } }
							// translators: %(domain)s is the domain name
							title={ sprintf( __( 'Set %(domain)s as your primary address' ), {
								domain: domainName,
							} ) }
							description={ __( "It's the URL visitors see in their browser's address bar." ) }
							decoration={ <Icon icon={ atSymbol } /> }
						/>
						<RouterLinkSummaryButton
							to={ siteOverviewRoute.fullPath }
							params={ { siteSlug } }
							title={ __( 'Bring your email with you' ) }
							description={ __( "Email hosting wasn't included with your transfer." ) }
							decoration={ <Icon icon={ envelope } /> }
						/>
					</VStack>
				</VStack>
			</VStack>
		</InboundTransferStep>
	);
};
