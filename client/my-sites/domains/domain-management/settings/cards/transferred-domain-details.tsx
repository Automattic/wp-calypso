/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMyDomainInputMode } from 'calypso/components/domains/connect-domain-step/constants';
import { transferStatus } from 'calypso/lib/domains/constants';
import { INCOMING_DOMAIN_TRANSFER_STATUSES } from 'calypso/lib/url/support';
import { domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import type { DetailsCardProps } from './types';

import './style.scss';

const TransferredDomainDetails = ( {
	domain,
	isLoadingPurchase,
	selectedSite,
}: DetailsCardProps ): JSX.Element => {
	const translate = useTranslate();

	const renderStartTransferButton = () => {
		if ( ! domain.currentUserIsOwner || transferStatus.PENDING_START !== domain.transferStatus ) {
			return null;
		}

		return (
			<Button
				primary
				href={ domainUseMyDomain(
					selectedSite.slug,
					domain.name,
					useMyDomainInputMode.startPendingTransfer
				) }
				disabled={ isLoadingPurchase }
			>
				{ translate( 'Start transfer' ) }
			</Button>
		);
	};

	const getDescriptionText = () => {
		const { currentUserIsOwner, name, owner } = domain;
		if ( transferStatus.PENDING_START === domain.transferStatus ) {
			return currentUserIsOwner
				? translate(
						'We need you to complete a couple of steps before we can transfer {{strong}}%(domain)s{{/strong}} from your ' +
							'current domain provider to WordPress.com. Your domain will stay at your current provider ' +
							'until the transfer is completed.',
						{
							args: {
								domain: name,
							},
							components: {
								strong: <strong />,
							},
						}
				  )
				: translate(
						'This domain transfer is waiting to be initiated. Please contact the domain owner, {{strong}}%(owner)s{{/strong}}, to start it.',
						{
							args: {
								owner,
							},
							components: {
								strong: <strong />,
							},
						}
				  );
		} else if ( transferStatus.CANCELLED === domain.transferStatus ) {
			return currentUserIsOwner
				? translate(
						'We were unable to complete the transfer of {{strong}}%(domain)s{{/strong}}. ' +
							'You can remove the transfer from your account or try to start the transfer again. ' +
							'{{a}}Learn more{{/a}}',
						{
							args: {
								domain: name,
							},
							components: {
								strong: <strong />,
								a: (
									<a
										href={ INCOMING_DOMAIN_TRANSFER_STATUSES }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
				  )
				: translate(
						'The domain transfer failed to complete. Please contact the domain owner, {{strong}}%(owner)s{{/strong}}, to restart it.',
						{
							args: {
								owner,
							},
							components: {
								strong: <strong />,
							},
						}
				  );
		}

		return translate(
			'Your transfer has been started and is waiting for authorization from your current ' +
				'domain provider. This process can take up to 7 days. If you need to cancel or expedite the ' +
				'transfer please contact them for assistance.'
		);
	};

	return (
		<div className="details-card">
			<div className="details-card__section">{ getDescriptionText() }</div>
			<div className="details-card__section">{ renderStartTransferButton() }</div>
		</div>
	);
};

export default TransferredDomainDetails;
