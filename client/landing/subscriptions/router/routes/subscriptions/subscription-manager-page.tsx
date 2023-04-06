import { UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import { useTranslate } from 'i18n-calypso';
import { Outlet } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { Tabs } from 'calypso/landing/subscriptions/components/tabs';
import { useSubheaderText } from 'calypso/landing/subscriptions/hooks';
import './styles.scss';

const SubscriptionManagementPage = () => {
	const translate = useTranslate();
	return (
		<>
			<UniversalNavbarHeader
				className="subscription-manager-header"
				variant="minimal"
				isLoggedIn={ false }
			/>
			<Main className="subscription-manager__container">
				<DocumentHead title="Subscriptions" />
				<FormattedHeader
					brandFont
					headerText={ translate( 'Subscription management' ) }
					subHeaderText={ useSubheaderText() }
					align="left"
				/>
				<Tabs />
				<Outlet />
			</Main>
		</>
	);
};

export default SubscriptionManagementPage;
