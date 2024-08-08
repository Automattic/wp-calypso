import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { QueryArgParsed } from '@wordpress/url/build-types/get-query-arg';
import SubscriberUploadForm from './subscriber-upload-form';
import type { SiteDetails } from '@automattic/data-stores';

type Props = {
	nextStepUrl: string;
	selectedSite?: SiteDetails;
	fromSite: QueryArgParsed;
};

export default function Subscribers( { nextStepUrl, selectedSite, fromSite }: Props ) {
	if ( ! selectedSite ) {
		return null;
	}
	return (
		<Card>
			<h2>Step 1: Export your subscribers from Substack</h2>
			<p>
				To generate a CSV file of all your Substack subscribers, go to the Subscribers tab and click
				'Export.' Once the CSV file is downloaded, upload it in the next step.
			</p>
			<Button variant="secondary" href={ `https://${ fromSite }/publish/subscribers` }>
				Export subscribers
			</Button>
			<hr />
			<h2>Step 2: Import your subscribers to WordPress.com</h2>
			{ selectedSite.ID && (
				<SubscriberUploadForm siteId={ selectedSite.ID } nextStepUrl={ nextStepUrl } />
			) }
		</Card>
	);
}
