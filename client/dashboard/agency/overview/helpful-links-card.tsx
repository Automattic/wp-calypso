import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import SummaryButton from '../../components/summary-button';
import { SummaryButtonList } from '../../components/summary-button-list';
import NewTabLabel from '../components/new-tab-label';
import type { RecordTracksEvent } from '../tiers/types';

export interface HelpfulLink {
	id: string;
	label: string;
	href?: string;
	/** Opens the link in a new tab. */
	isExternal?: boolean;
	onClick?: () => void;
	/** A short pill beside the label, such as "Beta". */
	badge?: string;
}

function HelpfulLinkTitle( { link }: { link: HelpfulLink } ) {
	const label = link.isExternal ? (
		<NewTabLabel justify="flex-start">{ link.label }</NewTabLabel>
	) : (
		link.label
	);
	if ( ! link.badge ) {
		return label;
	}
	return (
		<HStack alignment="left" spacing={ 2 } expanded={ false }>
			<span>{ label }</span>
			<Badge intent="stable">{ link.badge }</Badge>
		</HStack>
	);
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
					title={ <HelpfulLinkTitle link={ link } /> }
					href={ link.href }
					target={ link.isExternal ? '_blank' : undefined }
					rel={ link.isExternal ? 'noreferrer' : undefined }
					showArrow={ false }
					onClick={ () => {
						recordTracksEvent?.( 'calypso_a4a_overview_helpful_link_click', {
							link_id: link.id,
						} );
						link.onClick?.();
					} }
				/>
			) ) }
		</SummaryButtonList>
	);
}
