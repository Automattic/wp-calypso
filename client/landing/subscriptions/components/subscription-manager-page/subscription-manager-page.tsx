import { SubscriptionManager } from '@automattic/data-stores';
import { UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import classNames from 'classnames';
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
	const translate = useTranslate();
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	return (
		<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Subscriptions }>
			<UniversalNavbarHeader
				className={ classNames( 'subscription-manager-header', {
					'is-logged-in': isLoggedIn,
				} ) }
				variant="minimal"
				isLoggedIn={ isLoggedIn }
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
