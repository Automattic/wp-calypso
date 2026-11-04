import { Button, Tooltip, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { NEW_REPORT_PARAM } from './constants';
import AmplifyLearnMoreModal from './learn-more-modal';
import AmplifyNewReportModal from './new-report-modal';
import type { AmplifyTiersLink } from './types';
import type { AmplifyPage } from './use-amplify-page';

// Read from `window.location` rather than a router, since the classic A4A
// dashboard renders this page without TanStack Router.
function hasNewReportParam() {
	return new URLSearchParams( window.location.search ).has( NEW_REPORT_PARAM );
}

function clearNewReportParam() {
	const url = new URL( window.location.href );
	if ( url.searchParams.has( NEW_REPORT_PARAM ) ) {
		url.searchParams.delete( NEW_REPORT_PARAM );
		window.history.replaceState( window.history.state, '', url );
	}
}

/** "Learn more" and "New report" for the page header, with the modals they open. */
export default function AmplifyHeaderActions( {
	page,
	tiersLink,
}: {
	page: AmplifyPage;
	tiersLink?: AmplifyTiersLink;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const [ isNewReportOpen, setIsNewReportOpen ] = useState( hasNewReportParam );
	const closeNewReport = () => {
		clearNewReportParam();
		setIsNewReportOpen( false );
	};
	const [ isLearnMoreOpen, setIsLearnMoreOpen ] = useState( false );

	// With no reports yet, the page body already shows the URL form.
	useEffect( () => {
		if ( page.state === 'empty' && isNewReportOpen ) {
			clearNewReportParam();
			setIsNewReportOpen( false );
		}
	}, [ page.state, isNewReportOpen ] );

	if ( page.state === 'empty' ) {
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
