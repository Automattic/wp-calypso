/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CONTACT, GSUITE_LEARNING_CENTER } from 'calypso/lib/url/support';
import PurchaseDetail from 'calypso/components/purchase-detail';
import { useSelector } from 'react-redux';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { isGoogleWorkspaceExtraLicence } from 'calypso/lib/purchases';
import { isGSuiteOrExtraLicenseOrGoogleWorkspace } from '@automattic/calypso-products';
import { getGoogleMailServiceFamily, isGSuiteExtraLicenseProductSlug } from 'calypso/lib/gsuite';

const GoogleAppsDetails = ( { purchases } ) => {
	const email = useSelector( getCurrentUserEmail );

	const purchase = purchases.find( isGSuiteOrExtraLicenseOrGoogleWorkspace );
	const productFamily = getGoogleMailServiceFamily( purchase.productSlug );

	if (
		isGoogleWorkspaceExtraLicence( purchase ) ||
		isGSuiteExtraLicenseProductSlug( purchase.productSlug )
	) {
		return (
			<PurchaseDetail
				icon="mail"
				title={ i18n.translate(
					'Keep an eye on your email to finish setting up your new email addresses'
				) }
				description={ i18n.translate(
					'We are setting up your new %(productFamily)s users but {{strong}}this process can take several minutes' +
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
							productFamily,
						},
						comment: '%(productFamily)s can be either "G Suite" or "Google Workspace"',
					}
				) }
				isRequired
			/>
		);
	}

	const productName = purchase.productName;

	return (
		<PurchaseDetail
			icon="mail"
			title={ i18n.translate(
				'Keep an eye on your email to finish setting up your %(productName)s account',
				{
					args: {
						productName,
					},
					comment:
						'%(productName)s can be "G Suite", "G Suite Business" or "Google Workspace Business Starter"',
				}
			) }
			description={
				<div>
					<p>
						{ i18n.translate(
							'We are setting up your new %(productFamily)s account but {{strong}}this process can take several ' +
								'minutes{{/strong}}. We will email you at %(email)s with login information once it is ' +
								'ready, so you can start using your new professional email addresses and other %(productFamily)s apps.',
							{
								components: {
									strong: <strong />,
								},
								args: {
									email,
									productFamily,
								},
								comment: '%(productFamily)s can be either "G Suite" or "Google Workspace"',
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
			buttonText={ i18n.translate( 'Learn more about %(productFamily)s', {
				args: {
					productFamily,
				},
				comment: '%(productFamily)s can be either "G Suite" or "Google Workspace"',
			} ) }
			href={ GSUITE_LEARNING_CENTER }
			target="_blank"
			rel="noopener noreferrer"
			requiredText={ i18n.translate( 'Almost done! One step remaining…' ) }
			isRequired
		/>
	);
};

export default GoogleAppsDetails;
