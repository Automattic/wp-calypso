/**
 * External dependencies
 */
import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	isProductsListFetching as getIsProductListFetching,
	getProductName,
} from 'calypso/state/products-list/selectors';
import JetpackLogo from 'calypso/components/jetpack-logo';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	productSlug: string | 'no_product';
}

const JetpackCheckoutSitelessThankYouCompleted: FC< Props > = ( { productSlug } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasProductInfo = productSlug !== 'no_product';

	const productName = useSelector( ( state ) =>
		hasProductInfo ? getProductName( state, productSlug ) : null
	);

	const isProductListFetching = useSelector( ( state ) => getIsProductListFetching( state ) );

	const happinessAppointmentLink = '/checkout/jetpack/schedule-happiness-appointment';

	return (
		<Main wideLayout className="jetpack-checkout-siteless-thank-you-completed">
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path="/checkout/jetpack/thank-you-completed/no-site/:product"
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Siteless Thank You Completed"
			/>
			<Card className="jetpack-checkout-siteless-thank-you-completed__card">
				<div className="jetpack-checkout-siteless-thank-you-completed__card-main">
					<JetpackLogo size={ 45 } />
					<h1
						className={
							isProductListFetching
								? 'jetpack-checkout-siteless-thank-you-completed__main-message-loading'
								: 'jetpack-checkout-siteless-thank-you-completed__main-message'
						}
					>
						{ translate( 'Your %(productName)s subscription will be activated soon', {
							args: {
								productName,
							},
						} ) }
					</h1>
					<p>
						{ translate(
							'As soon as your subscription is activated you will receive a confirmation email from our Happiness Engineers.'
						) }
					</p>
					<p>
						{ translate(
							'If you prefer to setup Jetpack with the help of our Happiness Engineers, {{a}}schedule a 15 minute call now{{/a}}.',
							{
								components: {
									a: (
										<a
											className="jetpack-checkout-siteless-thank-you-completed__link"
											onClick={ () =>
												dispatch(
													recordTracksEvent( 'calypso_siteless_checkout_happiness_link_clicked', {
														product_slug: productSlug,
													} )
												)
											}
											href={ happinessAppointmentLink }
										/>
									),
								},
							}
						) }
					</p>
				</div>
			</Card>
		</Main>
	);
};

export default JetpackCheckoutSitelessThankYouCompleted;
