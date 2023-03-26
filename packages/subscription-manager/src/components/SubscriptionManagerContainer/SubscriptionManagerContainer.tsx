/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import { useSubscriberEmailAddress } from '@automattic/data-stores/src/reader/hooks';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import './styles.scss';

export type SubscriptionManagerContainerProps = {
	children?: React.ReactNode;
};

const useSubHeaderText = () => {
	const emailAddress = useSubscriberEmailAddress();
	const translate = useTranslate();

	return useMemo( () => {
		if ( emailAddress ) {
			return translate(
				"Manage the WordPress.com newsletter and blogs you've subscribed to with {{span}}%(emailAddress)s{{/span}}.",
				{
					args: {
						emailAddress: emailAddress,
					},
					components: {
						span: <span className="email-address" />,
					},
				}
			);
		}
		return translate( 'Manage your WordPress.com newsletter and blog subscriptions.' );
	}, [ emailAddress, translate ] );
};

const SubscriptionManagerContainer = ( { children }: SubscriptionManagerContainerProps ) => {
	const translate = useTranslate();

	return (
		<Main className="subscription-manager-container">
			<DocumentHead title="Subscriptions" />
			<FormattedHeader
				brandFont
				headerText={ translate( 'Subscription management' ) }
				subHeaderText={ useSubHeaderText() }
				align="left"
			/>
			{ children }
		</Main>
	);
};

export default SubscriptionManagerContainer;
