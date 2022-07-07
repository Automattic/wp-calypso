import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { domainAddNew } from 'calypso/my-sites/domains/paths';

import './email-upsell-navigation.scss';

const EmailUpsellNavigation = ( { siteSlug }: { siteSlug: string } ) => {
	const translate = useTranslate();

	return (
		<div className="email-upsell-navigation">
			<Button borderless href={ domainAddNew( siteSlug ) }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ translate( 'Back' ) }
			</Button>
			<Button borderless href={ `/checkout/${ siteSlug }` }>
				{ translate( 'Skip' ) }
				<Gridicon icon="arrow-right" size={ 18 } />
			</Button>
		</div>
	);
};

export default EmailUpsellNavigation;
