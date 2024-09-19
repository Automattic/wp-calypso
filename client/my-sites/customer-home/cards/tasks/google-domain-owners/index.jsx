import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { isDesktop } from '@automattic/viewport';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import googleDomainOwnersMobileIllustration from 'calypso/assets/images/customer-home/illustration--task-google-domain-owners-mobile.svg';
import googleDomainOwnersDesktopIllustration from 'calypso/assets/images/customer-home/illustration--task-google-domain-owners.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { TASK_GOOGLE_DOMAIN_OWNERS } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

import './style.scss';

export default function GoogleDomainOwners() {
	const translate = useTranslate();

	const [ ctaIsBusy, setCtaIsBusy ] = useState( false );
	const getCtaClickHandler = async () => {
		setCtaIsBusy( true );

		page( localizeUrl( 'https://wordpress.com/transfer-google-domains/' ) );
	};

	const cardTitle = translate( 'Reclaim your Google domains' );

	const cardSubtitle = translate(
		'Google Domains has been sold to Squarespace and, while they promise steady first-year prices, future increases can’t be ruled out.{{br}}{{/br}}Transfer your domains to WordPress.com now—we’ll lower our prices to match, and pay for an extra year',
		{
			components: {
				br: <br />,
			},
		}
	);

	const googleDomainOwnersIllustration = isDesktop()
		? googleDomainOwnersDesktopIllustration
		: googleDomainOwnersMobileIllustration;

	return (
		<Task
			customClass="task__google-domain-owners"
			title={ cardTitle }
			description={ preventWidows( cardSubtitle ) }
			actionText={ translate( 'Learn more' ) }
			actionOnClick={ getCtaClickHandler }
			actionBusy={ ctaIsBusy }
			hasSecondaryAction={ false }
			illustration={ googleDomainOwnersIllustration }
			illustrationAlwaysShow
			illustrationTopActions
			timing={ 2 }
			taskId={ TASK_GOOGLE_DOMAIN_OWNERS }
		/>
	);
}
