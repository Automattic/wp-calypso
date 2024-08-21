import { Card, Gridicon } from '@automattic/components';
import { Modal, Button } from '@wordpress/components';
import { Icon, people, currencyEuro } from '@wordpress/icons';
import { QueryArgParsed } from '@wordpress/url/build-types/get-query-arg';
import { useState } from 'react';
import SubscriberUploadForm from './subscriber-upload-form';
import type { SiteDetails } from '@automattic/data-stores';

type Props = {
	nextStepUrl: string;
	selectedSite: SiteDetails;
	fromSite: QueryArgParsed;
	skipNextStep: () => void;
	cardData: any;
};

export default function Subscribers( {
	nextStepUrl,
	selectedSite,
	fromSite,
	skipNextStep,
	cardData,
}: Props ) {
	const open = cardData.meta.paid_subscribers_count || false;
	const [ isOpen, setIsOpen ] = useState( open );

	return (
		<>
			<Card>
				<h2>Step 1: Export your subscribers from Substack</h2>
				<p>
					To generate a CSV file of all your Substack subscribers, go to the Subscribers tab and
					click 'Export.' Once the CSV file is downloaded, upload it in the next step.
				</p>
				<Button
					variant="secondary"
					href={ `https://${ fromSite }/publish/subscribers` }
					target="_blank"
					rel="noreferrer noopener"
				>
					Export subscribers <Gridicon icon="external" />
				</Button>
				<hr />
				<h2>Step 2: Import your subscribers to WordPress.com</h2>
				{ selectedSite.ID && (
					<SubscriberUploadForm
						siteId={ selectedSite.ID }
						nextStepUrl={ nextStepUrl }
						skipNextStep={ skipNextStep }
						cardData={ cardData }
					/>
				) }
			</Card>
			{ isOpen && (
				<Modal
					title="All done!"
					isDismissible={ false }
					onRequestClose={ () => setIsOpen( false ) }
					className="subscriber-upload-form__modal"
					size="medium"
				>
					<div>
						We’ve found 100 subscribers, where:
						<ul>
							<li>
								<Icon icon={ people } />
								<strong>82</strong> are free subscribers
							</li>
							<li>
								<Icon icon={ people } />
								<strong>1</strong> have a complimentary
							</li>
							<li>
								<Icon icon={ currencyEuro } />
								subscription <strong>18</strong> are paying subscribers
							</li>
						</ul>
					</div>
					<Button variant="primary" href={ nextStepUrl }>
						Continue
					</Button>
				</Modal>
			) }
		</>
	);
}
