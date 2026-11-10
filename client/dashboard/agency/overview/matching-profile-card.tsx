import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import OverviewCard from '../../components/overview-card';
import { REQUIRED_LEAD_MATCHING_FIELDS } from '../partner-directory/lead-matching/form-data';
import type { RecordTracksEvent } from '../tiers/types';

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
			/* translators: %(answered)d is the number of answered questions, %(total)d is the total and %(left)d is the number remaining. */
			__(
				'%(answered)d of %(total)d answered. Answer the last %(left)d to start receiving leads.'
			),
			{ answered, total, left: total - answered }
		),
		action: __( 'Finish preferences' ),
	};
}

export default function MatchingProfileCard( {
	href,
	answered,
	agencyId,
	recordTracksEvent,
}: {
	href: string;
	answered: number;
	agencyId?: number;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	const total = REQUIRED_LEAD_MATCHING_FIELDS.length;
	const copy = getMatchingPromptCopy( answered );

	return (
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
								/* translators: %(answered)d is the number of answered questions and %(total)d is the total. */
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
						href={ href }
						onClick={ () =>
							recordTracksEvent?.( 'calypso_a4a_overview_lead_matching_click', {
								agency_id: agencyId,
							} )
						}
					>
						{ copy.action }
					</Button>
				</HStack>
			}
		/>
	);
}
