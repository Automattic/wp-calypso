import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import gotoCheckoutPage from './stats-purchase-checkout-redirect';
import { StatsCommercialPriceDisplay } from './stats-purchase-shared';
import { COMPONENT_CLASS_NAME } from './stats-purchase-wizard';

interface CommercialPurchaseProps {
	planValue: number;
	currencyCode: string;
	siteSlug: string;
	adminUrl: string;
	redirectUri: string;
	from: string;
}

const CommercialPurchase = ( {
	planValue,
	currencyCode,
	siteSlug,
	adminUrl,
	redirectUri,
	from,
}: CommercialPurchaseProps ) => {
	const translate = useTranslate();

	return (
		<div>
			<div
				className={ classNames(
					`${ COMPONENT_CLASS_NAME }__notice`,
					`${ COMPONENT_CLASS_NAME }__notice--green`
				) }
			>
				{ translate(
					'Upgrade now to take advantage of the introductory flat rate. Starting in 2024, we will introduce metered billing. '
				) }
				<Button
					variant="link"
					href="https://jetpack.com/redirect/?source=jetpack-stats-learn-more-about-site-types"
					target="_blank"
					rel="noopener noreferrer"
				>
					{ translate( 'Learn more' ) }
				</Button>
			</div>

			<StatsCommercialPriceDisplay planValue={ planValue } currencyCode={ currencyCode } />

			<div className={ `${ COMPONENT_CLASS_NAME }__benefits` }>
				<p>{ translate( 'Benefits:' ) }</p>
				<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--included` }>
					<li>{ translate( 'Instant access to upcoming features' ) }</li>
					<li>{ translate( 'Priority support' ) }</li>
				</ul>
			</div>

			<p>
				{ translate(
					`By clicking the button below, you agree to our {{a}}Terms of Service{{/a}} and to {{b}}share details{{/b}} with WordPress.com.`,
					{
						components: {
							a: (
								<Button
									variant="link"
									target="_blank"
									href={ localizeUrl( 'https://wordpress.com/tos/' ) }
								/>
							),
							b: (
								<Button
									variant="link"
									target="_blank"
									rel="noopener noreferrer"
									href={ localizeUrl( 'https://jetpack.com/support/what-data-does-jetpack-sync/' ) }
								/>
							),
						},
					}
				) }
			</p>

			<Button
				variant="primary"
				onClick={ () =>
					gotoCheckoutPage( { from, type: 'commercial', siteSlug, adminUrl, redirectUri } )
				}
			>
				{ translate( 'Get Jetpack Stats' ) }
			</Button>
		</div>
	);
};

export default CommercialPurchase;
