import { SubscriptionManager } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';

const useSubheaderText = () => {
	const emailAddress = SubscriptionManager.useSubscriberEmailAddress();
	const translate = useTranslate();
	const locale = useLocale();
	const { hasTranslation } = useI18n();
	return useMemo( () => {
		if ( emailAddress ) {
			return locale.startsWith( 'en' ) ||
				hasTranslation(
					'Manage WordPress.com sites and newsletters you’ve subscribed to with {{span}}%(emailAddress)s{{/span}}.'
				)
				? translate(
						'Manage WordPress.com sites and newsletters you’ve subscribed to with {{span}}%(emailAddress)s{{/span}}.',
						{
							args: {
								emailAddress: emailAddress,
							},
							components: {
								span: <span className="email-address" />,
							},
						}
				  )
				: translate(
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
		return locale.startsWith( 'en' ) ||
			hasTranslation( 'Manage your WordPress.com site and newsletter subscriptions.' )
			? translate( 'Manage your WordPress.com site and newsletter subscriptions.' )
			: translate( 'Manage your WordPress.com blog and newsletter subscriptions.' );
	}, [ emailAddress, translate ] );
};

export default useSubheaderText;
