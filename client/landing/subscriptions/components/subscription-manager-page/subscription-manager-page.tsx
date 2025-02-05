import { SubscriptionManager } from '@automattic/data-stores';
import { useLocalizeUrl, useLocale } from '@automattic/i18n-utils';
import { UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { TabsSwitcher } from 'calypso/landing/subscriptions/components/tabs-switcher';
import { useSubheaderText } from 'calypso/landing/subscriptions/hooks';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from '../subscription-manager-context';
import './styles.scss';

const SubscriptionManagementPage = () => {
	const locale = useLocale();
	const localizeUrl = useLocalizeUrl();
	const translate = useTranslate();
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	const emailAddress = SubscriptionManager.useSubscriberEmailAddress();

	const startUrl = addQueryArgs(
		localizeUrl( '//wordpress.com/start/account/user', locale, isLoggedIn ),
		{
			redirect_to: '/reader',
			ref: 'reader-lp',
			...( emailAddress ? { email_address: emailAddress } : {} ),
		}
	);

	const loginUrl = addQueryArgs(
		localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn, true ),
		{
			...( emailAddress ? { email_address: emailAddress } : {} ),
		}
	);

	return (
		<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Subscriptions }>
			<UniversalNavbarHeader
				className={ clsx( 'subscription-manager-header', {
					'is-logged-in': isLoggedIn,
				} ) }
				variant="minimal"
				isLoggedIn={ isLoggedIn }
				startUrl={ startUrl }
				loginUrl={ loginUrl }
			/>
			<Main className="subscription-manager__container">
				<FormattedHeader
					brandFont
					headerText={ translate( 'Subscription management' ) }
					subHeaderText={ useSubheaderText() }
					align="left"
				/>
				<TabsSwitcher />
			</Main>
		</SubscriptionManagerContextProvider>
	);
};

export default SubscriptionManagementPage;
