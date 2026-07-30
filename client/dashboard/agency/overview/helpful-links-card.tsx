import { __ } from '@wordpress/i18n';
import SummaryButton from '../../components/summary-button';
import { SummaryButtonList } from '../../components/summary-button-list';
import NewTabLabel from './new-tab-label';
import type { RecordTracksEvent } from '../tiers/types';

export interface HelpfulLink {
	id: string;
	label: string;
	href?: string;
	/** Opens in a new tab. `SummaryButton` has no `target`, so the click is handled here. */
	isExternal?: boolean;
	onClick?: () => void;
}

interface HelpfulLinksCardProps {
	links: HelpfulLink[];
	recordTracksEvent?: RecordTracksEvent;
}

export default function HelpfulLinksCard( { links, recordTracksEvent }: HelpfulLinksCardProps ) {
	return (
		<SummaryButtonList title={ __( 'Helpful links' ) }>
			{ links.map( ( link ) => (
				<SummaryButton
					key={ link.id }
					title={
						link.isExternal ? (
							<NewTabLabel justify="flex-start">{ link.label }</NewTabLabel>
						) : (
							link.label
						)
					}
					href={ link.href }
					showArrow={ false }
					onClick={ ( event ) => {
						recordTracksEvent?.( 'calypso_a4a_overview_helpful_link_click', {
							link_id: link.id,
						} );
						// Leave modifier clicks to the browser so they keep their native
						// new-tab and new-window behavior.
						if (
							link.isExternal &&
							link.href &&
							! event.metaKey &&
							! event.ctrlKey &&
							! event.shiftKey
						) {
							event.preventDefault();
							window.open( link.href, '_blank', 'noreferrer' );
						}
						link.onClick?.();
					} }
				/>
			) ) }
		</SummaryButtonList>
	);
}
