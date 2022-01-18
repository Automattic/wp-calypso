import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMyDomainInputMode } from 'calypso/components/domains/connect-domain-step/constants';
import { domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import type { TransferConnectedDomainNudgeProps } from './types';
import './style.scss';

const TransferConnectedDomainNudge = ( {
	siteSlug,
	domain,
}: TransferConnectedDomainNudgeProps ): JSX.Element | null => {
	const translate = useTranslate();
	const message = translate(
		'Your domain is expiring soon. Consider {{a}}transferring it{{/a}} to WordPress.com to manage your site and domains all from one place.',
		{
			components: {
				a: (
					<a
						href={ domainUseMyDomain( siteSlug, domain.name, useMyDomainInputMode.transferDomain ) }
					/>
				),
			},
		}
	);

	if ( ! domain.showTransferConnectedDomainNudge ) {
		return null;
	}

	return (
		<div className="transfer-connected-domain-nudge">
			<Icon icon={ info } size={ 18 } viewBox="2 2 20 20" />
			<span>{ message }</span>
		</div>
	);
};

export default TransferConnectedDomainNudge;
