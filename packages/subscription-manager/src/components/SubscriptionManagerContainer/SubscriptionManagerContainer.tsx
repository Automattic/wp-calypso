/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';

export type SubscriptionManagerContainerProps = {
	children?: React.ReactNode;
};

const SubscriptionManagerContainer = ( { children }: SubscriptionManagerContainerProps ) => {
	return (
		<Main className="site-settings">
			<DocumentHead title="Subscriptions" />
			<FormattedHeader brandFont headerText="Subscriptions" align="left" />
			{ children }
		</Main>
	);
};

export default SubscriptionManagerContainer;
