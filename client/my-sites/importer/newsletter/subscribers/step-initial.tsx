import { Card } from '@automattic/components';
import { Subscriber } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { external } from '@wordpress/icons';
import { useTranslate, fixMe } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
import isSiteOnFreePlan from 'calypso/state/selectors/is-site-on-free-plan';
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
	const translate = useTranslate();
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

	const isOnFreePlan = useSelector( ( state ) => isSiteOnFreePlan( state, selectedSite.ID ) );

	return (
		<Card>
			<h2>{ translate( 'Step 1: Export your subscribers from Substack' ) }</h2>
			<p>
				{ fixMe( {
					text: 'In Substack, go to {{strong}}Subscribers{{/strong}}, scroll down to the "All subscribers" table, click the {{strong}}…{{/strong}} menu on the right and select {{strong}}Export{{/strong}}. Choose the "Export all columns" option and download the CSV file. Then upload the CSV below.',
					newCopy: translate(
						'In Substack, go to {{strong}}Subscribers{{/strong}}, scroll down to the "All subscribers" table, click the {{strong}}…{{/strong}} menu on the right and select {{strong}}Export{{/strong}}. Choose the "Export all columns" option and download the CSV file. Then upload the CSV below.',
						{
							components: {
								strong: <strong />,
							},
						}
					),
					oldCopy: translate(
						'Generate a CSV of your Substack subscribers. In Substack, go to {{strong}}Subscribers{{/strong}}, click {{strong}}Export{{/strong}} under "All subscribers," then upload the CSV in the next step. On the free plan, {{supportLink}}you can import up to 100 subscribers.{{/supportLink}}',
						{
							components: {
								strong: <strong />,
								supportLink: (
									<InlineSupportLink
										noWrap={ false }
										showIcon={ false }
										supportLink={ localizeUrl(
											'https://wordpress.com/support/import-subscribers-to-a-newsletter/#troubleshooting-subscriber-imports'
										) }
										supportPostId={ 220199 }
									/>
								),
							},
						}
					),
				} ) }
			</p>
			{ isOnFreePlan && (
				<p>
					{ fixMe( {
						text: 'Note: On the free plan, you can import up to 100 subscribers.',
						newCopy: translate(
							'Note: On the free plan, {{supportLink}}you can import up to 100 subscribers.{{/supportLink}}',
							{
								components: {
									supportLink: (
										<InlineSupportLink
											noWrap={ false }
											showIcon={ false }
											supportLink={ localizeUrl(
												'https://wordpress.com/support/import-subscribers-to-a-newsletter/#import-limits'
											) }
											supportPostId={ 220199 }
										/>
									),
								},
							}
						),
						oldCopy: '',
					} ) }
				</p>
			) }
			<Button
				href={ `https://${ normalizeFromSite( fromSite ) }/publish/subscribers` }
				target="_blank"
				rel="noreferrer noopener"
				icon={ external }
				iconPosition="right"
				variant="primary"
			>
				{ translate( 'Open Substack subscribers' ) }
			</Button>
			<hr />
			<h2>{ translate( 'Step 2: Import your subscribers' ) }</h2>
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
