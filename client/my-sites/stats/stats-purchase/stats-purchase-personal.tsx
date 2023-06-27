/* eslint-disable jsx-a11y/anchor-is-valid */
import { PricingSlider, RenderThumbFunction } from '@automattic/components';
import { Button } from '@wordpress/components';

interface PersonalPurchaseProps {
	subscriptionValue: number;
	setSubscriptionValue: ( value: number ) => number;
}

const PersonalPurchase = ( { subscriptionValue, setSubscriptionValue }: PersonalPurchaseProps ) => {
	const sliderLabel = ( ( props, state ) => {
		return <div { ...props }>${ state?.valueNow || subscriptionValue }/month</div>;
	} ) as RenderThumbFunction;

	return (
		<div>
			<PricingSlider
				value={ subscriptionValue }
				renderThumb={ sliderLabel }
				onChange={ setSubscriptionValue }
			/>

			<p className="average-price">The average person pays $6 per month</p>

			<div className="benefits">
				{ subscriptionValue === 0 ? (
					<ul className="not-included">
						<li>No access to upcoming features</li>
						<li>No priority support</li>
						<li>You’ll see upsells and ads in the Stats page</li>
					</ul>
				) : (
					<ul className="included">
						<li>Instant access to upcoming features</li>
						<li>Priority support</li>
						<li>Ad-free experience</li>
						{ subscriptionValue >= 90 && <li>You’re one of the top supporters — thank you!</li> }
					</ul>
				) }
			</div>

			<p>
				By clicking the button below, you agree to our <a href="#">Terms of Service</a> and to{ ' ' }
				<a href="#">share details</a> with WordPress.com.
			</p>

			{ subscriptionValue === 0 ? (
				<Button isSecondary>Continue with Jetpack Stats for free</Button>
			) : (
				<Button isPrimary>Get Jetpack Stats for ${ subscriptionValue } per month</Button>
			) }
		</div>
	);
};

export default PersonalPurchase;
