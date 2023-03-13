/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import SectionNav from 'calypso/components/section-nav';
import Item from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import './styles.scss';

export type SubscriptionManagerContainerProps = {
	children?: React.ReactNode;
};

const SubscriptionManagerContainer = ( { children }: SubscriptionManagerContainerProps ) => {
	const translate = useTranslate();
	return (
		<Main className="subscription-manager-container">
			{ /* <DocumentHead title="Subscriptions" /> */ }
			<FormattedHeader
				brandFont
				headerText={ translate( 'Subscription management' ) }
				subHeaderText={ translate(
					'Manage your WordPress.com newsletter and blog subscriptions.'
				) }
				align="left"
			/>
			<SectionNav>
				<NavTabs>
					<Item path="/subscriptions/sites">{ translate( 'Sites' ) }</Item>
					<Item path="/subscriptions/settings">{ translate( 'Settings' ) }</Item>
				</NavTabs>
			</SectionNav>
			{ children }
		</Main>
	);
};

export default SubscriptionManagerContainer;
