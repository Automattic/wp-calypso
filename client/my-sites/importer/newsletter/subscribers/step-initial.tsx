import { Card } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { external } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import exportSubstackSubscribersImg from 'calypso/assets/images/importer/export-substack-subscribers.png';
import { SubscribersStepProps } from '../types';
import { normalizeFromSite } from '../utils';
import SubscriberUploadForm from './upload-form';

export default function StepInitial( {
	selectedSite,
	fromSite,
	siteSlug,
	skipNextStep,
	cardData,
	engine,
	setAutoFetchData,
}: SubscribersStepProps ) {
	const { __ } = useI18n();
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
	}, [ importSelector?.inProgress, setAutoFetchData ] );

	return (
		<Card>
			<h2>{ __( 'Step 1: Export your subscribers from Substack' ) }</h2>
			<p>
				{ createInterpolateElement(
					__(
						'Generate a CSV file of all your Substack subscribers. On Substack, go to the <strong>Subscribers</strong> tab and click the <strong>Export</strong> button you’ll find on top of the table. Then, upload the downloaded CSV in the next step.'
					),
					{
						strong: <strong />,
					}
				) }
			</p>
			<img
				src={ exportSubstackSubscribersImg }
				alt={ __( 'Export Substack subscribers' ) }
				className="export-subscribers"
			/>
			<Button
				href={ `https://${ normalizeFromSite( fromSite ) }/publish/subscribers` }
				target="_blank"
				rel="noreferrer noopener"
				icon={ external }
				iconPosition="right"
				variant="primary"
			>
				{ __( 'Open Substack subscribers' ) }
			</Button>
			<hr />
			<h2>{ __( 'Step 2: Import your subscribers to WordPress.com' ) }</h2>
			{ selectedSite.ID && (
				<SubscriberUploadForm
					siteId={ selectedSite.ID }
					nextStepUrl={ `/import/newsletter/${ engine }/${ siteSlug }/summary?from=${ fromSite }` }
					skipNextStep={ skipNextStep }
					cardData={ cardData }
				/>
			) }
		</Card>
	);
}
