import { Card, ConfettiAnimation } from '@automattic/components';
import { Icon, post, people, currencyDollar } from '@wordpress/icons';

export default function Summary() {
	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	return (
		<Card>
			<ConfettiAnimation trigger={ ! prefersReducedMotion } />
			<h2>Success!</h2>
			<div className="summary__content">
				<p>Here's an overview of what you'll migrate:</p>
				<p>
					<Icon icon={ post } />
					<strong>47</strong> posts
				</p>
				<p>
					<Icon icon={ people } />
					<strong>99</strong> subscribers
				</p>
				<p>
					<Icon icon={ currencyDollar } />
					<strong>17</strong>paid subscribers
				</p>
			</div>
		</Card>
	);
}
