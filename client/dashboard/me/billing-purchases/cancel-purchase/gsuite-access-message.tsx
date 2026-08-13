import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
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
	const { meta, product_slug: productSlug } = purchase;
	const domainName = meta ?? '';
	if ( ! productSlug || ! selectedDomain ) {
		return null;
	}
	const googleMailService = getGoogleMailServiceFamily( productSlug );
	const googleSubscriptionStatus = getGSuiteSubscriptionStatus( selectedDomain );

	if ( [ 'suspended', '' ].includes( googleSubscriptionStatus ) ) {
		return (
			<p>
				{ createInterpolateElement(
					// Translators: <domainName /> is the name of the domain (e.g. example.com) and <googleMailService /> is either "G Suite" or "Google Workspace"
					__(
						'If you cancel your subscription for <domainName /> now, <strong>you will lose access to all of your <googleMailService /> features immediately</strong>, and you will need to purchase a new subscription with Google if you wish to regain access to them.'
					),
					{
						domainName: <>{ domainName }</>,
						googleMailService: <>{ googleMailService }</>,
						strong: <strong />,
					}
				) }
			</p>
		);
	}

	return (
		<p>
			{ createInterpolateElement(
				// Translators: <domainName /> is the name of the domain (e.g. example.com), <googleMailService /> is either "G Suite" or "Google Workspace", and <days /> is a number of days (usually '30')
				__(
					'If you cancel your subscription for <domainName /> now, <strong>you will lose access to all of your <googleMailService /> features <days /> days after it expires</strong>. After that time, you will need to purchase a new subscription with Google if you wish to regain access to them.'
				),
				{
					domainName: <>{ domainName }</>,
					googleMailService: <>{ googleMailService }</>,
					days: <>{ 30 }</>,
					strong: <strong />,
				}
			) }
		</p>
	);
}
