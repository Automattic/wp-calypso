import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { getGSuiteSubscriptionStatus, getGoogleMailServiceFamily } from '../../../utils/gsuite';
import type { Purchase, Domain } from '@automattic/api-core';

interface GSuiteAccessMessageProps {
	purchase: Purchase;
	selectedDomain?: Domain;
}

export default function GSuiteAccessMessage( {
	purchase,
	selectedDomain,
}: GSuiteAccessMessageProps ) {
	const { meta: domainName, product_slug: productSlug } = purchase;
	if ( ! productSlug || ! selectedDomain ) {
		return null;
	}
	const googleMailService = getGoogleMailServiceFamily( productSlug );
	const googleSubscriptionStatus = getGSuiteSubscriptionStatus( selectedDomain );

	if ( [ 'suspended', '' ].includes( googleSubscriptionStatus ) ) {
		return (
			<p>
				{ createInterpolateElement(
					sprintf(
						// Translators: %(domainName) is the name of the domain (e.g. example.com) and %(googleMailService)s can be either "G Suite" or "Google Workspace"
						__(
							'If you cancel your subscription for %(domainName)s now, <strong>you will lose access to all of ' +
								'your %(googleMailService)s features immediately</strong>, and you will ' +
								'need to purchase a new subscription with Google if you wish to regain access to them.'
						),
						{
							domainName,
							googleMailService,
						}
					),
					{
						strong: <strong />,
					}
				) }
			</p>
		);
	}

	return (
		<p>
			{ createInterpolateElement(
				sprintf(
					// Translators: %(domainName) is the name of the domain (e.g. example.com), %(googleMailService)s can be either "G Suite" or "Google Workspace", and %(days)d is a number of days (usually '30')
					__(
						'If you cancel your subscription for %(domainName)s now, <strong>you will lose access to all of ' +
							'your %(googleMailService)s features in %(days)d days</strong>. After that time, ' +
							'you will need to purchase a new subscription with Google if you wish to regain access to them.'
					),
					{
						domainName,
						googleMailService,
						days: 30,
					}
				),
				{
					strong: <strong />,
				}
			) }
		</p>
	);
}
