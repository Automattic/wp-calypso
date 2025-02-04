/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { INCOMING_DOMAIN_TRANSFER_STATUSES } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import { useMyDomainInputMode } from 'calypso/components/domains/connect-domain-step/constants';
import { transferStatus } from 'calypso/lib/domains/constants';
import { domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import type { DetailsCardProps } from './types';

import './style.scss';

const TransferredDomainDetails = ( {
	domain,
	isLoadingPurchase,
	selectedSite,
}: DetailsCardProps ) => {
	const translate = useTranslate();

	const getStartTransferHref = ( siteSlug: string, domainName: string ) => {
		return domainUseMyDomain( siteSlug, {
			domain: domainName,
			initialMode: useMyDomainInputMode.startPendingTransfer,
		} );
	};

	const renderStartTransferButton = () => {
		if ( ! domain.currentUserIsOwner || transferStatus.PENDING_START !== domain.transferStatus ) {
			return null;
		}

		return (
			<Button
				primary
				href={ getStartTransferHref( selectedSite.slug, domain.name ) }
				disabled={ isLoadingPurchase }
			>
				{ domain.lastTransferError
					? translate( 'Restart transfer' )
					: translate( 'Start transfer' ) }
			</Button>
		);
	};

	const getDescriptionText = () => {
		const { currentUserIsOwner, lastTransferError, name, owner } = domain;

		if ( lastTransferError ) {
			return currentUserIsOwner
				? translate(
						'We tried to start a transfer for your domain {{strong}}%(domain)s{{/strong}} but we got the following error: {{br/}}{{br/}}{{p}}{{code}}%(lastTransferError)s{{/code}}{{/p}}' +
							'Please restart the transfer or contact your current domain provider for more details.',
						{
							args: {
								domain: name,
								lastTransferError,
							},
							components: {
								strong: <strong />,
								br: <br />,
								p: <p />,
								code: <code />,
							},
						}
				  )
				: translate(
						'We tried to start a transfer for the domain {{strong}}%(domain)s{{/strong}} but an error occurred. ' +
							'Please contact the domain owner, {{strong}}%(owner)s{{/strong}}, for more details.',
						{
							args: {
								domain: name,
								owner,
							},
							components: {
								strong: <strong />,
							},
						}
				  );
		}

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
										href={ localizeUrl( INCOMING_DOMAIN_TRANSFER_STATUSES ) }
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
				"domain provider. Your current domain provider should allow you to speed this process up, either through their website or an email they've already sent you."
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
