import { Button, Tooltip, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import AmplifyLearnMoreModal from './learn-more-modal';
import AmplifyNewReportModal from './new-report-modal';
import type { AmplifyTiersLink } from './types';
import type { AmplifyPage } from './use-amplify-page';

/** "Learn more" and "New report" for the page header, with the modals they open. */
export default function AmplifyHeaderActions( {
	page,
	tiersLink,
}: {
	page: AmplifyPage;
	tiersLink?: AmplifyTiersLink;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const [ isNewReportOpen, setIsNewReportOpen ] = useState( false );
	const [ isLearnMoreOpen, setIsLearnMoreOpen ] = useState( false );

	if ( page.state === 'empty' || page.state === 'loading' ) {
		return null;
	}

	let newReportButton = (
		<Button
			__next40pxDefaultSize
			variant="primary"
			onClick={ () => {
				recordTracksEvent( 'calypso_a4a_amplify_new_report_click' );
				setIsNewReportOpen( true );
			} }
			disabled={ ! page.canScan }
			accessibleWhenDisabled
		>
			{ __( 'New report' ) }
		</Button>
	);
	if ( ! page.canScan ) {
		newReportButton = (
			<Tooltip
				text={
					page.usageStatus === 'cap'
						? __( 'You’ve used all your reports for this month.' )
						: __( 'Reports unlock once your account is activated.' )
				}
			>
				{ newReportButton }
			</Tooltip>
		);
	}

	return (
		<HStack spacing={ 2 } alignment="center" expanded={ false }>
			{ page.state === 'reports' && (
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ () => {
						recordTracksEvent( 'calypso_a4a_amplify_learn_more_click' );
						setIsLearnMoreOpen( true );
					} }
				>
					{ __( 'Learn more' ) }
				</Button>
			) }
			{ newReportButton }
			{ isNewReportOpen && (
				<AmplifyNewReportModal
					agencyId={ page.agencyId }
					canScan={ page.canScan }
					usage={ page.usage }
					usageStatus={ page.usageStatus }
					tierId={ page.tierId }
					tiersLink={ tiersLink }
					onUsageError={ page.handleUsageError }
					onClose={ () => setIsNewReportOpen( false ) }
					onCreated={ () => setIsNewReportOpen( false ) }
				/>
			) }
			{ isLearnMoreOpen && <AmplifyLearnMoreModal onClose={ () => setIsLearnMoreOpen( false ) } /> }
		</HStack>
	);
}
