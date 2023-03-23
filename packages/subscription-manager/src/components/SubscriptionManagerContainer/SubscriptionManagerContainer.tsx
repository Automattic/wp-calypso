/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import { getSubkey } from '@automattic/data-stores/src/reader/helpers';
import { useTranslate, LocalizeProps } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import './styles.scss';

export type SubscriptionManagerContainerProps = {
	children?: React.ReactNode;
};

const getEmailAddress = () => {
	const subkey = getSubkey();

	if ( ! subkey ) {
		return null;
	}

	const decodedSubkeyValue = decodeURIComponent( subkey );

	const firstPeriodIndex = decodedSubkeyValue.indexOf( '.' );
	if ( firstPeriodIndex === -1 ) {
		return null;
	}

	const emailAddress = decodedSubkeyValue.slice( firstPeriodIndex + 1 );
	return emailAddress;
};

const getSubHeaderText = ( translate: LocalizeProps[ 'translate' ] ) => {
	const emailAddress = getEmailAddress();
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
};

const SubscriptionManagerContainer = ( { children }: SubscriptionManagerContainerProps ) => {
	const translate = useTranslate();

	return (
		<Main className="subscription-manager-container">
			<DocumentHead title="Subscriptions" />
			<FormattedHeader
				brandFont
				headerText={ translate( 'Subscription management' ) }
				subHeaderText={ getSubHeaderText( translate ) }
				align="left"
			/>
			{ children }
		</Main>
	);
};

export default SubscriptionManagerContainer;
