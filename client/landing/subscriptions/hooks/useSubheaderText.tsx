import { Reader } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';

const useSubheaderText = () => {
	const emailAddress = Reader.useSubscriberEmailAddress();
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

export default useSubheaderText;
