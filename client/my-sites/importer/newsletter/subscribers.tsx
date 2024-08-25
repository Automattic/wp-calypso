import { Card } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { Icon, people, currencyEuro, external } from '@wordpress/icons';
import { QueryArgParsed } from '@wordpress/url/build-types/get-query-arg';
import { useEffect, useRef } from 'react';
import SubscriberUploadForm from './subscriber-upload-form';
import type { SiteDetails } from '@automattic/data-stores';

type Props = {
	nextStepUrl: string;
	selectedSite: SiteDetails;
	fromSite: QueryArgParsed;
	skipNextStep: () => void;
	cardData: any;
	engine: string;
};

export default function Subscribers( {
	nextStepUrl,
	selectedSite,
	fromSite,
	skipNextStep,
	cardData,
	engine,
}: Props ) {
	const queryClient = useQueryClient();
	const { importSelector } = useSelect( ( select ) => {
		const subscriber = select( Subscriber.store );
		return {
			importSelector: subscriber.getImportSubscribersSelector(),
		};
	}, [] );

	const prevInProgress = useRef( importSelector?.inProgress );
	useEffect( () => {
		if ( ! prevInProgress.current && importSelector?.inProgress ) {
			setTimeout( () => {
				queryClient.invalidateQueries( {
					queryKey: [ 'paid-newsletter-importer', selectedSite.ID, engine, 'subscribers' ],
				} );
			}, 1500 ); // 1500ms = 1.5s delay so that we have enought time to propagate the changes.
		}

		prevInProgress.current = importSelector?.inProgress;
	}, [ importSelector?.inProgress ] );

	const open = cardData?.meta?.status === 'pending' || false;

	const all_emails = cardData?.meta?.email_count || 0;
	const paid_emails = cardData?.meta?.paid_subscribers_count || 0;
	const free_emails = all_emails - paid_emails;

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
					iconPosition="right"
					icon={ external }
				>
					Export subscribers
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
			{ open && (
				<Modal
					title="All done!"
					isDismissible={ false }
					onRequestClose={ () => {} }
					className="subscriber-upload-form__modal"
					size="medium"
				>
					<div>
						We’ve found { all_emails } subscribers.
						<ul>
							{ free_emails !== 0 && (
								<li>
									<Icon icon={ people } />
									<strong>{ free_emails }</strong> are free subscribers
								</li>
							) }
							{ paid_emails !== 0 && (
								<li>
									<Icon icon={ currencyEuro } />
									subscription <strong>{ paid_emails }</strong> are paying subscribers
								</li>
							) }
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
