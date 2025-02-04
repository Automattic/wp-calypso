import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Icon, starFilled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useMyDomainInputMode } from 'calypso/components/domains/connect-domain-step/constants';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import { domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import type { TransferConnectedDomainNudgeProps } from './types';
import './style.scss';

const TransferConnectedDomainNudge = ( {
	domain,
	location,
	siteSlug,
}: TransferConnectedDomainNudgeProps ) => {
	const translate = useTranslate();

	const domainRegistryExpiryDate = moment( domain.registryExpiryDate );
	const fiveDaysInThePast = moment().subtract( 5, 'days' );
	const fortyFiveDaysInTheFuture = moment().add( 45, 'days' );

	if (
		domain.type !== domainTypes.MAPPED ||
		! domain.isEligibleForInboundTransfer ||
		! domain.registryExpiryDate ||
		! domainRegistryExpiryDate.isBetween( fiveDaysInThePast, fortyFiveDaysInTheFuture )
	) {
		return null;
	}

	const trackNudgeLinkClick = (): boolean => {
		recordTracksEvent( 'calypso_domain_management_transfer_connected_domain_nudge_link_click', {
			domain: domain.name,
			location,
		} );
		return true;
	};

	const messageOptions = {
		components: {
			a: (
				<a
					href={ domainUseMyDomain( siteSlug, {
						domain: domain.name,
						initialMode: useMyDomainInputMode.transferDomain,
					} ) }
					onClick={ trackNudgeLinkClick }
				/>
			),
		},
	};
	const messageExpiring = translate(
		'Your domain is expiring soon at your external provider. Consider {{a}}transferring it{{/a}} to WordPress.com to manage your site and domains all from one place.',
		messageOptions
	);
	const messageExpired = translate(
		'Your domain has recently expired at your external provider. Consider {{a}}transferring it{{/a}} to WordPress.com to manage your site and domains all from one place.',
		messageOptions
	);

	return (
		<div className="transfer-connected-domain-nudge">
			<Icon icon={ starFilled } size={ 18 } viewBox="2 2 20 20" />
			<span>
				{ moment().isBefore( domainRegistryExpiryDate ) ? messageExpiring : messageExpired }
			</span>
		</div>
	);
};

export default TransferConnectedDomainNudge;
