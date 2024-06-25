import { Card, Button } from '@automattic/components';

export default function Content( { nextStepUrl } ) {
	return (
		<Card>
			<h2>Step 1: Export your content from Substack</h2>
			<p>
				To generate a ZIP file of all your Substack posts, go to Settings { '>' } Exports and click
				'Create a new export.' Once the ZIP file is downloaded, upload it in the next step.
			</p>
			<Button>Export content</Button>
			<hr />
			<h2>Step 2: Import your content to WordPress.com (2/2)</h2>
			<Button href={ nextStepUrl } primary>
				Continue
			</Button>{ ' ' }
			<Button href={ nextStepUrl }>Skip for now</Button>
		</Card>
	);
}
