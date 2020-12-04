/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CONTACT, GOOGLE_APPS_LEARNING_CENTER } from 'calypso/lib/url/support';
import PurchaseDetail from 'calypso/components/purchase-detail';
import { useSelector } from 'react-redux';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { isGoogleApps } from 'calypso/lib/products-values';
import { isGSuiteExtraLicenseProductSlug } from 'calypso/lib/gsuite';

const GoogleAppsDetails = ( { purchases } ) => {
	const email = useSelector( getCurrentUserEmail );

	const purchase = purchases.find( isGoogleApps );

	if ( isGSuiteExtraLicenseProductSlug( purchase.productSlug ) ) {
		return (
			<PurchaseDetail
				icon="mail"
				title={ i18n.translate(
					'Keep an eye on your email to finish setting up your new email addresses'
				) }
				description={ i18n.translate(
					'We are setting up your new G Suite users but {{strong}}this process can take several minutes' +
						'{{/strong}}. We will email you at %(email)s with login information once they are ready but if ' +
						"you still haven't received anything after a few hours, do not hesitate to {{link}}contact support{{/link}}.",
					{
						components: {
							strong: <strong />,
							link: (
								<a
									className="checkout-thank-you__gsuite-support-link"
									href={ CONTACT }
									rel="noopener noreferrer"
									target="_blank"
								/>
							),
						},
						args: {
							email,
						},
					}
				) }
				isRequired
			/>
		);
	}

	return (
		<PurchaseDetail
			icon="mail"
			title={ i18n.translate(
				'Keep an eye on your email to finish setting up your G Suite account'
			) }
			description={
				<div>
					<p>
						{ i18n.translate(
							'We are setting up your new G Suite account but {{strong}}this process can take several ' +
								'minutes{{/strong}}. We will email you at %(email)s with login information once it is ' +
								'ready, so you can start using your new professional email addresses and other G Suite apps.',
							{
								components: {
									strong: <strong />,
								},
								args: {
									email,
								},
							}
						) }
					</p>

					<p>
						{ i18n.translate(
							"If you still haven't received anything after a few hours, do not hesitate to {{link}}contact support{{/link}}.",
							{
								components: {
									link: (
										<a
											className="checkout-thank-you__gsuite-support-link"
											href={ CONTACT }
											rel="noopener noreferrer"
											target="_blank"
										/>
									),
								},
							}
						) }
					</p>
				</div>
			}
			buttonText={ i18n.translate( 'Learn more about G Suite' ) }
			href={ GOOGLE_APPS_LEARNING_CENTER }
			target="_blank"
			rel="noopener noreferrer"
			requiredText={ i18n.translate( 'Almost done! One step remaining…' ) }
			isRequired
		/>
	);
};

export default GoogleAppsDetails;
