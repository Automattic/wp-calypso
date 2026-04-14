import { Button, TextareaControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useRequestAnotherReviewMutation from '../hooks/use-request-another-review-mutation';
import type { TaggedSite } from '../types';

import './style.scss';

export default function RequestReviewModal( {
	onClose,
	site,
	fetchMigratedSites,
}: {
	onClose: () => void;
	site: TaggedSite;
	fetchMigratedSites: () => void;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { mutate: requestReview, isPending } = useRequestAnotherReviewMutation();

	const [ reason, setReason ] = useState( '' );

	const isValid = reason.trim().length > 0;

	const handleSubmit = () => {
		requestReview(
			{
				siteId: site.id,
				reason: reason.trim(),
			},
			{
				onSuccess: () => {
					fetchMigratedSites();
					dispatch(
						recordTracksEvent( 'calypso_a4a_migrations_request_another_review_success', {
							site_id: site.id,
						} )
					);
					dispatch(
						successNotice(
							translate(
								'Your verification request for {{strong}}%(siteUrl)s{{/strong}} has been submitted.',
								{
									components: { strong: <strong /> },
									args: { siteUrl: site.url },
								}
							),
							{ id: 'a4a-commission-request-review-success', duration: 5000 }
						)
					);
					onClose();
				},
				onError: ( error ) => {
					dispatch( errorNotice( error.message ) );
				},
			}
		);
		dispatch(
			recordTracksEvent( 'calypso_a4a_migrations_request_another_review_submit', {
				site_id: site.id,
			} )
		);
	};

	const handleOnClose = () => {
		onClose();
		dispatch( recordTracksEvent( 'calypso_a4a_migrations_request_another_review_close' ) );
	};

	return (
		<A4AModal
			onClose={ handleOnClose }
			className="request-review-modal"
			extraActions={
				<Button
					variant="primary"
					onClick={ handleSubmit }
					disabled={ isPending || ! isValid }
					isBusy={ isPending }
				>
					{ translate( 'Submit request' ) }
				</Button>
			}
			title={ translate( 'Request another verification' ) }
			subtile={ translate(
				'Please specify why {{strong}}%(siteUrl)s{{/strong}} needs to be verified again.',
				{
					components: { strong: <strong /> },
					args: { siteUrl: site.url },
				}
			) }
		>
			<TextareaControl
				label={ translate( 'Reason for re-verification' ) }
				value={ reason }
				onChange={ setReason }
				placeholder={ translate( 'Describe why this site needs to be verified again' ) }
				rows={ 4 }
			/>
		</A4AModal>
	);
}
