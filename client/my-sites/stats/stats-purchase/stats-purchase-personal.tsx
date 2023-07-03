/* eslint-disable jsx-a11y/anchor-is-valid */
import { PricingSlider, RenderThumbFunction } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { COMPONENT_CLASS_NAME } from './stats-purchase-wizard';

interface PersonalPurchaseProps {
	subscriptionValue: number;
	setSubscriptionValue: ( value: number ) => number;
}

const AVERAGE_PRICE_INFO = '$6';

const PersonalPurchase = ( { subscriptionValue, setSubscriptionValue }: PersonalPurchaseProps ) => {
	const translate = useTranslate();

	const sliderLabel = ( ( props, state ) => {
		return (
			<div { ...props }>
				${ state?.valueNow || subscriptionValue }/{ translate( 'month' ) }
			</div>
		);
	} ) as RenderThumbFunction;

	return (
		<div>
			<PricingSlider
				value={ subscriptionValue }
				renderThumb={ sliderLabel }
				onChange={ setSubscriptionValue }
			/>

			<p className={ `${ COMPONENT_CLASS_NAME }__average-price` }>
				{ translate( 'The average person pays %(value)s per month', {
					args: {
						value: AVERAGE_PRICE_INFO,
					},
				} ) }
			</p>

			<div className={ `${ COMPONENT_CLASS_NAME }__benefits` }>
				{ subscriptionValue === 0 ? (
					<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--not-included` }>
						<li>{ translate( 'No access to upcoming features' ) }</li>
						<li>{ translate( 'No priority support' ) }</li>
						<li>{ translate( "You'll see upsells and ads in the Stats page" ) }</li>
					</ul>
				) : (
					<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--included` }>
						<li>{ translate( 'Instant access to upcoming features' ) }</li>
						<li>{ translate( 'Priority support' ) }</li>
						<li>{ translate( 'Ad-free experience' ) }</li>
						{ subscriptionValue >= 90 && (
							<li>{ translate( "You're one of the top supporters — thank you!" ) }</li>
						) }
					</ul>
				) }
			</div>

			<p>
				{ translate(
					`By clicking the button below, you agree to our {{a}}Terms of Service{{/a}} and to {{b}}share details{{/b}} with WordPress.com.`,
					{
						components: {
							a: <Button variant="link" href="#" />,
							b: <Button variant="link" href="#" />,
						},
					}
				) }
			</p>

			{ subscriptionValue === 0 ? (
				<Button variant="primary">{ translate( 'Continue with Jetpack Stats for free' ) }</Button>
			) : (
				<Button variant="primary">
					{ translate( 'Get Jetpack Stats for %(value)s per month', {
						args: {
							value: subscriptionValue,
						},
					} ) }
				</Button>
			) }
		</div>
	);
};

export default PersonalPurchase;
