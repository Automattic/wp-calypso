import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import OverviewCard from '../../components/overview-card';
import { REQUIRED_LEAD_MATCHING_FIELDS } from '../partner-directory/lead-matching/form-data';
import type { RecordTracksEvent } from '../tiers/types';

/**
 * Behind the design preview flag, `lm-answered=<n>` stands in for a saved
 * profile with n answers, so the partly answered state can be reviewed.
 */
export function getPreviewAnsweredCount(): number | undefined {
	const answered = Number.parseInt(
		new URLSearchParams( window.location.search ).get( 'lm-answered' ) ?? '',
		10
	);
	return Number.isNaN( answered )
		? undefined
		: Math.min( Math.max( answered, 0 ), REQUIRED_LEAD_MATCHING_FIELDS.length );
}

function getMatchingPromptCopy( answered: number ) {
	const total = REQUIRED_LEAD_MATCHING_FIELDS.length;

	if ( answered === 0 ) {
		return {
			description: sprintf(
				/* translators: %d is the number of lead matching questions. */
				__( 'Answer %d questions about your ideal clients to start receiving leads.' ),
				total
			),
			action: __( 'Set up preferences' ),
		};
	}

	return {
		description: sprintf(
			/* translators: %(answered)d is the number of answered questions, %(total)d the number of questions, %(left)d the questions left. */
			__(
				'%(answered)d of %(total)d answered. Answer the last %(left)d to start receiving leads.'
			),
			{ answered, total, left: total - answered }
		),
		action: __( 'Finish preferences' ),
	};
}

/** Keeps the design preview flags on the link, so the next page shows the preview too. */
function getMatchingPromptHref( href: string ) {
	// Calypso flags use a literal plus as an enable prefix, rather than a space.
	const searchParams = new URLSearchParams( window.location.search.replace( /\+/g, '%2B' ) );
	const flags = searchParams.get( 'flags' );
	return flags ? addQueryArgs( href, { flags } ) : href;
}

export default function MatchingProfilePreview( {
	href,
	answered,
	agencyId,
	isDesignPreview = false,
	recordTracksEvent,
}: {
	href: string;
	answered: number;
	agencyId?: number;
	isDesignPreview?: boolean;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	const matchingHref = getMatchingPromptHref( href );
	const total = REQUIRED_LEAD_MATCHING_FIELDS.length;
	const copy = getMatchingPromptCopy( answered );

	return (
		<div className="agency-overview-lead-matching">
			<OverviewCard
				icon={ people }
				title={ __( 'Lead matching' ) }
				heading={ __( 'Get matched with clients' ) }
				description={ copy.description }
				progress={
					answered > 0
						? {
								value: answered,
								max: total,
								label: `${ answered }/${ total }`,
								ariaValueText: sprintf(
									/* translators: %(answered)d is the number of answered questions and %(total)d is the number of questions. */
									__( '%(answered)d of %(total)d questions answered' ),
									{ answered, total }
								),
							}
						: undefined
				}
				bottom={
					<HStack justify="flex-start">
						<Button
							__next40pxDefaultSize
							size="compact"
							variant="secondary"
							href={ matchingHref }
							onClick={ () =>
								recordTracksEvent?.( 'calypso_a4a_overview_lead_matching_click', {
									agency_id: agencyId,
									is_design_preview: isDesignPreview,
								} )
							}
						>
							{ copy.action }
						</Button>
					</HStack>
				}
			/>
		</div>
	);
}
