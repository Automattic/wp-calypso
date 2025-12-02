import { Domain, DomainTransferStatus } from '@automattic/api-core';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { domainTransferSetupRoute } from '../../app/router/domains';
import Notice from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';

export default function TransferredDomainDetails( { domain }: { domain: Domain } ) {
	const {
		current_user_is_owner,
		last_transfer_error,
		domain: domain_name,
		owner,
		transfer_status,
	} = domain;

	const renderDescriptionText = () => {
		if ( last_transfer_error ) {
			return current_user_is_owner ? (
				<>
					<Text as="p">
						{ createInterpolateElement(
							__(
								/* translators: <domain/> is the domain name */
								'We tried to start a transfer for your domain <domain/>, but we got the following error:'
							),
							{
								domain: <strong>{ domain_name }</strong>,
							}
						) }
					</Text>
					<Text as="p">
						<code>{ last_transfer_error }</code>
					</Text>
					<Text as="p">
						{ __(
							'Please restart the transfer or contact your current domain provider for more details.'
						) }
					</Text>
				</>
			) : (
				<Text as="p">
					{ createInterpolateElement(
						__(
							/* translators: <domain/> is the domain name, <owner/> is the domain owner */
							'We tried to start a transfer for your domain <domain/>, but an error occurred. Please contact the domain owner, <owner/>, for more details.'
						),
						{
							domain: <strong>{ domain_name }</strong>,
							owner: <strong>{ owner }</strong>,
						}
					) }
				</Text>
			);
		}

		if ( DomainTransferStatus.PENDING_START === transfer_status ) {
			return current_user_is_owner ? (
				<Text as="p">
					{ createInterpolateElement(
						__(
							/* translators: <domain/> is the domain name */
							'We need you to complete a couple of steps before we can transfer <domain/> from your current domain provider to WordPress.com. Your domain will stay at your current provider until the transfer is completed.'
						),
						{
							domain: <strong>{ domain_name }</strong>,
						}
					) }
				</Text>
			) : (
				<Text as="p">
					{ createInterpolateElement(
						__(
							/* translators: <owner/> is the domain owner */
							'This domain transfer is waiting to be initiated. Please contact the domain owner, <owner/>, to start it.'
						),
						{
							owner: <strong>{ owner }</strong>,
						}
					) }
				</Text>
			);
		} else if ( DomainTransferStatus.CANCELLED === transfer_status ) {
			return current_user_is_owner ? (
				<Text as="p">
					{ createInterpolateElement(
						__(
							/* translators: <domain/> is the domain name */
							'We were unable to complete the transfer of <domain/>. You can remove the transfer from your account or try to start it again.'
						),
						{
							domain: <strong>{ domain_name }</strong>,
						}
					) }
				</Text>
			) : (
				<Text as="p">
					{ createInterpolateElement(
						__(
							/* translators: <owner/> is the domain owner */
							'The domain transfer failed to complete. Please contact the domain owner, <owner/>, to restart it.'
						),
						{
							owner: <strong>{ owner }</strong>,
						}
					) }
				</Text>
			);
		}

		return (
			<Text as="p">
				{ __(
					'Your transfer has been started and is waiting for authorization from your current domain provider. Your current domain provider should allow you to speed this process up, either through their website or an email they’ve already sent you.'
				) }
			</Text>
		);
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const renderStartTransferButton = () => {
		if ( ! current_user_is_owner || DomainTransferStatus.PENDING_START !== transfer_status ) {
			return null;
		}
		return (
			// To do: add cta once we implemented the transfer flow
			<HStack>
				<RouterLinkButton
					variant="primary"
					to={ domainTransferSetupRoute.fullPath }
					params={ { domainName: domain_name } }
				>
					{ last_transfer_error ? __( 'Restart Transfer' ) : __( 'Start Transfer' ) }
				</RouterLinkButton>
			</HStack>
		);
	};

	const errorLevel = !! last_transfer_error || DomainTransferStatus.CANCELLED === transfer_status;
	return (
		<Notice variant={ errorLevel ? 'error' : 'info' }>
			<VStack spacing={ 4 }>
				{ renderDescriptionText() }
				{ renderStartTransferButton() }
			</VStack>
		</Notice>
	);
}
