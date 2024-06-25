import { Card, Button } from '@automattic/components';

export default function Subscribers( { nextStepUrl } ) {
	return (
		<Card>
			<h2>Step 1: Export your subscribers from Substack</h2>
			<p>
				To generate a CSV file of all your Substack subscribers, go to the Subscribers tab and click
				'Export.' Once the CSV file is downloaded, upload it in the next step.
			</p>
			<Button>Export subscribers</Button>
			<hr />
			<h2>Step 2: Import your subscribers to WordPress.com</h2>
			<Button href={ nextStepUrl } primary>
				Continue
			</Button>{ ' ' }
			<Button href={ nextStepUrl }>Skip for now</Button>
		</Card>
	);
}
