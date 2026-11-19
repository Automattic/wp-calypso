import { Button, Tooltip, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import AmplifyLearnMoreModal from './learn-more-modal';
import AmplifyNewReportModal from './new-report-modal';
import type { AmplifyNewReportRequest, AmplifyTiersLink } from './types';
import type { AmplifyPage } from './use-amplify-page';

/** "Learn more" and "New report" for the page header, with the modals they open. */
export default function AmplifyHeaderActions( {
	page,
	tiersLink,
	newReportRequest,
}: {
	page: AmplifyPage;
	tiersLink?: AmplifyTiersLink;
	newReportRequest?: AmplifyNewReportRequest;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const [ isNewReportOpen, setIsNewReportOpen ] = useState(
		newReportRequest?.isRequested ?? false
	);
	const closeNewReport = () => {
		if ( newReportRequest?.isRequested ) {
			newReportRequest.onClear();
		}
		setIsNewReportOpen( false );
	};
	const [ isLearnMoreOpen, setIsLearnMoreOpen ] = useState( false );

	// With no reports yet, the page body already shows the URL form.
	useEffect( () => {
		if ( page.state === 'empty' && isNewReportOpen ) {
			closeNewReport();
		}
	} );

	if ( page.state === 'empty' || page.state === 'loading' ) {
		return null;
	}

	let disabledReason: string | undefined;
	if ( ! page.canScan ) {
		disabledReason =
			page.usageStatus === 'cap'
				? __( 'You’ve used all your reports for this month.' )
				: __( 'Reports unlock once your account is activated.' );
	}
	// Always inside the tooltip, which shows nothing without text, so the button keeps its
	// place in the tree and focus when it becomes disabled.
	const newReportButton = (
		<Tooltip text={ disabledReason }>
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
		</Tooltip>
	);

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
			{ isNewReportOpen && page.state === 'reports' && (
				<AmplifyNewReportModal
					agencyId={ page.agencyId }
					canScan={ page.canScan }
					usage={ page.usage }
					usageStatus={ page.usageStatus }
					tierId={ page.tierId }
					tiersLink={ tiersLink }
					onUsageError={ page.handleUsageError }
					onClose={ closeNewReport }
					onCreated={ closeNewReport }
				/>
			) }
			{ isLearnMoreOpen && <AmplifyLearnMoreModal onClose={ () => setIsLearnMoreOpen( false ) } /> }
		</HStack>
	);
}
