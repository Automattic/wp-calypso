import { Card, Button } from '@automattic/components';

type Props = {
	nextStepUrl: string;
};

export default function PaidSubscribers( { nextStepUrl }: Props ) {
	return (
		<Card>
			<h2>Connect your Stripe account</h2>
			<p>
				To migrate your paid subscribers, ensure you're connecting the same Stripe account used with
				your current provider.
			</p>
			<Button primary>Connect with Stripe</Button>{ ' ' }
			<Button href={ nextStepUrl }>Skip for now</Button>
		</Card>
	);
}
