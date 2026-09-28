import { useParams } from '@tanstack/react-router';
import AgencyPartnerDirectoryLeadMatchingSection from './section';
import { isLeadMatchingSection } from './sections';

export default function AgencyPartnerDirectoryLeadMatchingSectionRoute() {
	const { section } = useParams( { strict: false } );

	if ( ! section || ! isLeadMatchingSection( section ) ) {
		return null;
	}

	// Keyed so the form starts from the saved answers when moving between sections.
	return <AgencyPartnerDirectoryLeadMatchingSection key={ section } section={ section } />;
}
