import { userPreferenceOptimisticMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { useAnalytics } from '../../app/analytics';
import NewTabLabel from '../components/new-tab-label';
import { isSpacefastPromoEnabled } from '../components/spacefast/constants';
import SpacefastPromoCard from '../components/spacefast/promo-card';
import { useRecordViewOnce } from '../lib/use-record-view-once';
import coverImage from './images/spacefast-report-cover-v3.webp';
import glanceImage from './images/spacefast-report-glance-v3.webp';
import nextStepsImage from './images/spacefast-report-next-v3.webp';
import type { AmplifyReport } from '@automattic/api-core';

export const SPACEFAST_BANNER_DISMISSED_PREFERENCE =
	'a4a-prospect-reports-spacefast-banner-dismissed';

const EXAMPLE_URL =
	'https://prospectreportremix.space.fast/__spacefast/in/sfl_3A_02okLfPVHDVx4EkOcz8rejwRjm4SK';

/**
 * Shows agencies how to turn a finished report into an interactive one with Spacefast,
 * above the reports list, during the Spacefast launch. It waits for the first completed
 * report so it never competes with creating one, and stays closed once the user closes it.
 * Temporary: when the launch promo ends, delete this file, its images and its preference.
 */
export default function ProspectReportsSpacefastBanner( {
	reports,
}: {
	reports: Pick< AmplifyReport, 'status' >[];
} ) {
	const isEnabled = isSpacefastPromoEnabled();
	const hasCompletedReport = reports.some( ( report ) => report.status === 'completed' );
	const isEligible = isEnabled && hasCompletedReport;
	const { data: isDismissed, isFetched } = useQuery( {
		...userPreferenceQuery( SPACEFAST_BANNER_DISMISSED_PREFERENCE ),
		enabled: isEligible,
	} );

	if ( ! isEligible || ! isFetched || isDismissed ) {
		return null;
	}
	return <SpacefastBannerCard />;
}

function SpacefastBannerCard() {
	const { recordTracksEvent } = useAnalytics();
	const { mutate: saveDismissed } = useMutation(
		userPreferenceOptimisticMutation( SPACEFAST_BANNER_DISMISSED_PREFERENCE )
	);

	useRecordViewOnce(
		'spacefast-prospect-reports',
		useCallback(
			() =>
				recordTracksEvent( 'calypso_a4a_spacefast_promo_view', { placement: 'prospect_reports' } ),
			[ recordTracksEvent ]
		)
	);

	// Pages from a Prospect Report rebuilt as an interactive space, shown in turn after the logo.
	const samples = [
		{ image: coverImage, label: __( 'Interactive reports' ) },
		{ image: glanceImage, label: __( 'Branded for your pitch' ) },
		{ image: nextStepsImage, label: __( 'Shared with a link' ) },
	];

	const features = [
		__(
			'As an Automattic for Agencies partner, you get an exclusive invitation: 30 days of Spacefast Pro free, plus 30 more days when you create your first space'
		),
		__( 'Design the report for your agency’s branding or your prospect’s branding' ),
		__( 'Works with the AI your team already uses, like Claude, ChatGPT, or Gemini' ),
		__(
			'Keep it in a private space for the people you invite, or make it public and share the link'
		),
	];

	return (
		<SpacefastPromoCard
			title={ __( 'Interactive reports with Spacefast' ) }
			description={ __(
				'Turn any Prospect Report into an interactive, branded presentation for your prospects or clients. Download the PDF, hand it to the AI your team already uses, and publish it to Spacefast in seconds.'
			) }
			features={ features }
			samples={ samples }
			onRedeemClick={ () =>
				recordTracksEvent( 'calypso_a4a_spacefast_promo_click', { placement: 'prospect_reports' } )
			}
			secondaryActions={
				<Button
					variant="link"
					href={ EXAMPLE_URL }
					target="_blank"
					rel="noreferrer"
					onClick={ () =>
						recordTracksEvent( 'calypso_a4a_spacefast_promo_example_click', {
							placement: 'prospect_reports',
						} )
					}
				>
					<NewTabLabel>{ __( 'See an example' ) }</NewTabLabel>
				</Button>
			}
			onClose={ () => {
				recordTracksEvent( 'calypso_a4a_spacefast_promo_dismiss_click', {
					placement: 'prospect_reports',
				} );
				saveDismissed( true );
			} }
		/>
	);
}
