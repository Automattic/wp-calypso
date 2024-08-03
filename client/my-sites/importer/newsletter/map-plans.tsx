import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';

type Props = {
	nextStepUrl: string;
};

export default function MapPlans( { nextStepUrl }: Props ) {
	return (
		<Card>
			<h2>Paid newsletter offering</h2>
			<p>
				<strong>
					Review the plans retieved from Stripe and create euqivalent plans in WordPress.com
				</strong>{ ' ' }
				to prevent disruption to your current paid subscribers.
			</p>
			<Button variant="primary">Continue</Button>{ ' ' }
			<Button variant="secondary" href={ nextStepUrl }>
				Skip for now
			</Button>
		</Card>
	);
}
