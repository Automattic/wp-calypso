import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { Notice } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useResetMutation } from 'calypso/data/paid-newsletter/use-reset-mutation';
import ImporterActionButton from '../../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../../importer-action-buttons/container';
import { SubscribersStepProps } from '../types';

interface StepDoneProps extends SubscribersStepProps {
	actionButton?: React.ReactNode;
}

export default function StepDone( {
	cardData,
	selectedSite,
	engine,
	siteSlug,
	actionButton,
}: StepDoneProps ) {
	const { __, _n } = useI18n();
	const { resetPaidNewsletter, isPending } = useResetMutation( {
		onSuccess: () => {
			page.redirect( `/import/newsletter/${ engine }/${ siteSlug }/content` );
		},
	} );
	const subscribedCount = parseInt( cardData?.meta?.email_count || '0' );
	const metaStatus = cardData?.meta?.status;
	const isFailed = metaStatus === 'failed';

	const handleStartOver = () => {
		if ( selectedSite?.ID ) {
			resetPaidNewsletter( selectedSite.ID, engine, 'content' );
		}
	};

	return (
		<Card>
			<h2>{ __( 'Import your subscribers' ) }</h2>
			{ isFailed ? (
				<>
					<Notice status="warning" className="importer__notice" isDismissible={ false }>
						{ __( 'The subscriber import failed. Please try again.' ) }
					</Notice>
					<ImporterActionButtonContainer noSpacing>
						<ImporterActionButton
							onClick={ handleStartOver }
							primary
							disabled={ isPending }
							busy={ isPending }
						>
							{ __( 'Start over' ) }
						</ImporterActionButton>
					</ImporterActionButtonContainer>
				</>
			) : (
				<>
					<Notice status="success" className="importer__notice" isDismissible={ false }>
						{ sprintf(
							// Translators: %d is number of subscribers.
							_n(
								'Success! %d subscriber has been added!',
								'Success! %d subscribers have been added!',
								subscribedCount
							),
							subscribedCount
						) }
					</Notice>
					{ actionButton }
				</>
			) }
		</Card>
	);
}
