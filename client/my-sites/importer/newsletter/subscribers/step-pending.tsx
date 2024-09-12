import { Card } from '@automattic/components';
import { Notice } from '@wordpress/components';
import { toInteger } from 'lodash';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ImporterActionButton from '../../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../../importer-action-buttons/container';
import { StepProps } from '../types';
import PaidSubscribers from './paid-subscribers';
import StartImportButton from './start-import-button';

export default function StepPending( {
	nextStepUrl,
	selectedSite,
	fromSite,
	siteSlug,
	skipNextStep,
	cardData,
	engine,
	isFetchingContent,
	setAutoFetchData,
	status,
}: StepProps ) {
	const allEmailsCount = toInteger( cardData?.meta?.email_count ) || 0;

	return (
		<Card>
			<Notice status="success" className="importer__notice" isDismissible={ false }>
				All set! We’ve found <strong>{ allEmailsCount } subscribers</strong> to import.
			</Notice>

			<PaidSubscribers
				cardData={ cardData }
				engine={ engine }
				fromSite={ fromSite }
				isFetchingContent={ isFetchingContent }
				nextStepUrl={ nextStepUrl }
				selectedSite={ selectedSite }
				setAutoFetchData={ setAutoFetchData }
				siteSlug={ siteSlug }
				skipNextStep={ skipNextStep }
				status={ status }
			/>

			{ ! cardData?.is_connected_stripe && (
				<ImporterActionButtonContainer noSpacing>
					<StartImportButton
						engine={ engine }
						siteId={ selectedSite.ID }
						hasPaidSubscribers={ false }
						step="subscribers"
					/>
					<ImporterActionButton
						href={ nextStepUrl }
						onClick={ () => {
							skipNextStep();
							recordTracksEvent( 'calypso_paid_importer_connect_stripe_skipped' );
						} }
					>
						Skip for now
					</ImporterActionButton>
				</ImporterActionButtonContainer>
			) }
		</Card>
	);
}
