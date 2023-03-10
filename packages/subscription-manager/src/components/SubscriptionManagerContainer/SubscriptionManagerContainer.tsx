/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import './styles.scss';

export type SubscriptionManagerContainerProps = {
	children?: React.ReactNode;
};

const SubscriptionManagerContainer = ( { children }: SubscriptionManagerContainerProps ) => {
	const translate = useTranslate();
	return (
		<Main className="subscription-manager-container">
			<DocumentHead title="Subscriptions" />
			<FormattedHeader
				brandFont
				headerText={ translate( 'Subscription management' ) }
				subHeaderText={ translate(
					'Manage your WordPress.com newsletter and blog subscriptions.'
				) }
				align="left"
			/>
			{ children }
		</Main>
	);
};

export default SubscriptionManagerContainer;
