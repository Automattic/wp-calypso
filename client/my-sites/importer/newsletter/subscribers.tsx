import { isEnabled } from '@automattic/calypso-config';
import { Card, Button } from '@automattic/components';
import { AddSubscriberForm } from '@automattic/subscriber';
import { useIsEligibleSubscriberImporter } from 'calypso/landing/stepper/hooks/use-is-eligible-subscriber-importer';
import type { SiteDetails } from '@automattic/data-stores';
type Props = {
	nextStepUrl: string;
	selectedSite: null | SiteDetails;
	newsletterUrl: string;
};

export default function Subscribers( { nextStepUrl, selectedSite, newsletterUrl }: Props ) {
	const isUserEligibleForSubscriberImporter = useIsEligibleSubscriberImporter();

	if ( selectedSite === null ) {
		return null;
	}
	return (
		<Card>
			<h2>Step 1: Export your subscribers from Substack</h2>
			<p>
				To generate a CSV file of all your Substack subscribers, go to the Subscribers tab and click
				'Export.' Once the CSV file is downloaded, upload it in the next step.
			</p>
			<Button href={ `https://${ newsletterUrl }/publish/subscribers` }>Export subscribers</Button>
			<hr />
			<h2>Step 2: Import your subscribers to WordPress.com</h2>
			<AddSubscriberForm
				siteId={ selectedSite.ID }
				showTitle={ false }
				manualListEmailInviting={ ! isUserEligibleForSubscriberImporter }
				showCsvUpload={ isEnabled( 'subscriber-csv-upload' ) }
			/>
			<Button href={ nextStepUrl } primary>
				Continue
			</Button>{ ' ' }
			<Button href={ nextStepUrl }>Skip for now</Button>
		</Card>
	);
}
