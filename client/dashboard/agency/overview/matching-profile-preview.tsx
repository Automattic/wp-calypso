import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import OverviewCard from '../../components/overview-card';
import type { RecordTracksEvent } from '../tiers/types';

export default function MatchingProfilePreview( {
	href,
	agencyId,
	isDesignPreview = false,
	recordTracksEvent,
}: {
	href: string;
	agencyId?: number;
	isDesignPreview?: boolean;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	// Calypso flags use a literal plus as an enable prefix, rather than a space.
	const searchParams = new URLSearchParams( window.location.search.replace( /\+/g, '%2B' ) );
	const flags = searchParams.get( 'flags' );
	const matchingHref = flags ? addQueryArgs( href, { flags } ) : href;

	return (
		<OverviewCard
			icon={ info }
			title={ __( 'Lead matching' ) }
			heading={ <span>{ __( 'Complete your matching profile' ) }</span> }
			description={ __(
				'Tell us about the clients and projects your agency works best with so we can find suitable leads.'
			) }
			bottom={
				<HStack justify="flex-start">
					<Button
						__next40pxDefaultSize
						variant="primary"
						href={ matchingHref }
						onClick={ () =>
							recordTracksEvent?.( 'calypso_a4a_overview_lead_matching_click', {
								agency_id: agencyId,
								is_design_preview: isDesignPreview,
							} )
						}
					>
						{ __( 'Complete profile' ) }
					</Button>
				</HStack>
			}
		/>
	);
}
