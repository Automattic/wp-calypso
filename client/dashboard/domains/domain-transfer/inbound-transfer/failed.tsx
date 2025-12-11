import { Domain } from '@automattic/api-core';
import { domainInboundTransferStatusQuery, purchaseQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon, __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { cancelCircleFilled } from '@wordpress/icons';
import { useAppContext } from '../../../app/context';
import { domainTransferSetupRoute } from '../../../app/router/domains';
import Notice from '../../../components/notice';
import RouterLinkButton from '../../../components/router-link-button';
import { Text } from '../../../components/text';
import { InboundTransferStep } from './transfer-step';

export const InboundTransferFailed = ( { domain }: { domain: Domain } ) => {
	const { name: appName } = useAppContext();
	const { data: domainInboundTransferStatus } = useQuery(
		domainInboundTransferStatusQuery( domain.domain )
	);
	const { data: purchase } = useQuery(
		purchaseQuery( parseInt( domain.subscription_id ?? '0', 10 ) )
	);

	return (
		<InboundTransferStep
			icon={
				<Icon
					size={ 24 }
					icon={ cancelCircleFilled }
					fill="var(--dashboard__foreground-color-error)"
				/>
			}
			title={ domain.domain }
			progress={ { currentStep: 3, color: 'var(--dashboard__foreground-color-error)' } }
			domain={ domain }
			purchase={ purchase }
		>
			<VStack spacing={ 8 }>
				<VStack spacing={ 4 }>
					<Text size="large" weight={ 500 }>
						{ __( 'Transfer failed' ) }
					</Text>
					<Text>
						{ sprintf(
							// translators: %(appName)s is the app name
							__( 'Your domain transfer to %(appName)s didn’t go through. This can happen if:' ),
							{
								appName,
							}
						) }
					</Text>
					<ul className="dashboard-inbound-transfer-failed__list">
						<li>
							<Text>{ __( 'The domain has expired' ) }</Text>
						</li>
						<li>
							<Text>{ __( 'Approval steps weren’t completed' ) }</Text>
						</li>
						<li>
							<Text>{ __( 'Your current provider blocked the transfer.' ) }</Text>
						</li>
					</ul>
					{ domain.last_transfer_error && (
						<>
							<Text>{ __( 'The last transfer error message we got was:' ) }</Text>
							<Notice variant="error">{ domain.last_transfer_error }</Notice>
						</>
					) }
					<Text>
						{ sprintf(
							// translators: %(registrar)s is the domain name provider
							__(
								'Restart the transfer, or contact %(registrar)s to reactivate your domain and try again.'
							),
							{
								registrar:
									domainInboundTransferStatus?.registrar ?? __( 'your domain name provider' ),
							}
						) }
					</Text>
				</VStack>
				<div>
					<RouterLinkButton
						variant="primary"
						__next40pxDefaultSize
						to={ domainTransferSetupRoute.fullPath }
						params={ { domainName: domain.domain } }
					>
						{ __( 'Restart transfer' ) }
					</RouterLinkButton>
				</div>
			</VStack>
		</InboundTransferStep>
	);
};
