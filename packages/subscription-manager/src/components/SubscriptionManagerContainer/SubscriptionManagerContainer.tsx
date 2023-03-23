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

const getEmailAddress = () => {
	const subkey: string | undefined = document.cookie
		?.split( ';' )
		?.map( ( c ) => c.trim() )
		?.find( ( c ) => c.startsWith( 'subkey=' ) )
		?.split( '=' )[ 1 ];

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

const SubscriptionManagerContainer = ( { children }: SubscriptionManagerContainerProps ) => {
	const translate = useTranslate();

	const getSubHeaderText = () => {
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

	return (
		<Main className="subscription-manager-container">
			<DocumentHead title="Subscriptions" />
			<FormattedHeader
				brandFont
				headerText={ translate( 'Subscription management' ) }
				subHeaderText={ getSubHeaderText() }
				align="left"
			/>
			{ children }
		</Main>
	);
};

export default SubscriptionManagerContainer;
