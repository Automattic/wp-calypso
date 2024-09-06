import { Card } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { Modal, Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { Icon, people, currencyDollar, external } from '@wordpress/icons';
import { QueryArgParsed } from '@wordpress/url/build-types/get-query-arg';
import { toInteger } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { SubscribersStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import SubscriberUploadForm from './subscriber-upload-form';
import type { SiteDetails } from '@automattic/data-stores';

type Props = {
	nextStepUrl: string;
	selectedSite: SiteDetails;
	fromSite: QueryArgParsed;
	skipNextStep: () => void;
	cardData: SubscribersStepContent;
	siteSlug: string;
	engine: string;
	setAutoFetchData: Dispatch< SetStateAction< boolean > >;
};

export default function Subscribers( {
	nextStepUrl,
	selectedSite,
	fromSite,
	siteSlug,
	skipNextStep,
	cardData,
	engine,
	setAutoFetchData,
}: Props ) {
	const { importSelector } = useSelect( ( select ) => {
		const subscriber = select( Subscriber.store );
		return {
			importSelector: subscriber.getImportSubscribersSelector(),
		};
	}, [] );

	const prevInProgress = useRef( importSelector?.inProgress );
	useEffect( () => {
		if ( ! prevInProgress.current && importSelector?.inProgress ) {
			setAutoFetchData( true );
		}

		prevInProgress.current = importSelector?.inProgress;
	}, [ importSelector?.inProgress ] );

	const open = cardData?.meta?.status === 'pending' || false;

	const all_emails = toInteger( cardData?.meta?.email_count ) || 0;
	const paid_emails = toInteger( cardData?.meta?.paid_subscribers_count ) || 0;
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
					href={ `https://${ fromSite }/publish/subscribers` }
					target="_blank"
					rel="noreferrer noopener"
					icon={ external }
					variant="secondary"
				>
					Export subscribers
				</Button>
				<hr />
				<h2>Step 2: Import your subscribers to WordPress.com</h2>
				{ selectedSite.ID && (
					<SubscriberUploadForm
						siteId={ selectedSite.ID }
						nextStepUrl={ `/import/newsletter/${ engine }/${ siteSlug }/summary?from=${ fromSite }` }
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
									<Icon icon={ currencyDollar } />
									<strong>{ paid_emails }</strong> are paying subscribers
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
