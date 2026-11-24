import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { isSpacefastPromoEnabled } from '../../components/spacefast/constants';
import SpacefastPromoCard from '../../components/spacefast/promo-card';
import { useRecordViewOnce } from '../../lib/use-record-view-once';
import designQuestionnaireImage from './images/spacefast-design-questionnaire.webp';
import homepageConceptsImage from './images/spacefast-homepage-concepts.webp';
import projectTrackerImage from './images/spacefast-project-tracker.webp';
import type { RecordTracksEvent } from '../../tiers/types';

/**
 * Leads the Dev tools page during the Spacefast launch, in both the dashboard
 * and a8c-for-agencies. It follows the page's dev tool cards, laid out wide.
 */
export default function SpacefastDevToolsSection( {
	recordTracksEvent,
}: {
	recordTracksEvent: RecordTracksEvent;
} ) {
	if ( ! isSpacefastPromoEnabled() ) {
		return null;
	}
	return <SpacefastDevToolsCard recordTracksEvent={ recordTracksEvent } />;
}

function SpacefastDevToolsCard( { recordTracksEvent }: { recordTracksEvent: RecordTracksEvent } ) {
	useRecordViewOnce(
		'spacefast-dev-tools',
		useCallback(
			() => recordTracksEvent( 'calypso_a4a_spacefast_promo_view', { placement: 'dev_tools' } ),
			[ recordTracksEvent ]
		)
	);

	// Sample spaces from spacefast.com/for/agencies, shown in turn after the logo.
	const samples = [
		{ image: designQuestionnaireImage, label: __( 'Design briefs' ) },
		{ image: homepageConceptsImage, label: __( 'Homepage comparisons' ) },
		{ image: projectTrackerImage, label: __( 'Project trackers' ) },
	];

	const features = [
		__(
			'As an Automattic for Agencies partner, you get an exclusive invitation: 30 days of Spacefast Pro free, plus 30 more days when you create your first space'
		),
		__(
			'Build client sites, prototypes, and internal agency tooling with database support, file uploads, and versioning included'
		),
		__(
			'Integrates seamlessly with the AI your team already uses, like Claude, ChatGPT, or Gemini'
		),
		__(
			'Keep client work safe in private spaces you invite people to, or make a space public and share it with the world'
		),
		__(
			'Made by Automattic and built on the infrastructure that runs Pressable, WordPress.com, and more'
		),
	];

	return (
		<SpacefastPromoCard
			title={ __( 'Spacefast' ) }
			description={ __(
				'Your team already uses AI to make websites, apps, prototypes, proposals, and more. Spacefast gives your team one shared place to ship them in seconds, right from your agent and ready for clients to see.'
			) }
			features={ features }
			samples={ samples }
			onRedeemClick={ () =>
				recordTracksEvent( 'calypso_a4a_spacefast_promo_click', { placement: 'dev_tools' } )
			}
		/>
	);
}
