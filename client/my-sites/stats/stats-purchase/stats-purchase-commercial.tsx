/* eslint-disable jsx-a11y/anchor-is-valid */
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { COMPONENT_CLASS_NAME } from './stats-purchase-wizard';
interface CommercialPurchaseProps {
	planValue: number;
}

const CommercialPurchase = ( { planValue }: CommercialPurchaseProps ) => {
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
				<Button variant="link" href="#">
					{ translate( 'Learn more' ) }
				</Button>
			</div>

			<div className={ `${ COMPONENT_CLASS_NAME }__pricing` }>
				<div className={ `${ COMPONENT_CLASS_NAME }__pricing-value` }>
					<div className={ `${ COMPONENT_CLASS_NAME }__pricing-currency` }>$</div>
					<div className={ `${ COMPONENT_CLASS_NAME }__pricing-amount` }>{ `${ planValue }` }</div>
				</div>
				<div className={ `${ COMPONENT_CLASS_NAME }__pricing-cadency` }>
					/{ translate( 'month' ) }
				</div>
			</div>

			<div className={ `${ COMPONENT_CLASS_NAME }__benefits` }>
				<p>{ translate( 'Benefits:' ) }</p>
				<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--included` }>
					<li>{ translate( 'Instant access to upcoming features' ) }</li>
					<li>{ translate( 'Priority support' ) }</li>
					<li>{ translate( 'Ad-free experience' ) }</li>
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
							b: <Button variant="link" href="#" />,
						},
					}
				) }
			</p>

			<Button variant="primary">
				{ translate( 'Get Jetpack Stats for $%(value)s per month', {
					args: {
						value: planValue,
					},
				} ) }
			</Button>
		</div>
	);
};

export default CommercialPurchase;
