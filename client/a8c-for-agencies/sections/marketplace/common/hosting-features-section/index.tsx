import PageSection, { PageSectionProps } from 'calypso/a8c-for-agencies/components/page-section';
import HostingOverviewFeatures from '../hosting-overview-features';

type Props = Omit< PageSectionProps, 'children' > & {
	items: {
		icon: JSX.Element;
		title: string;
		description: string;
	}[];
};

export default function HostingFeaturesSection( {
	icon,
	heading,
	subheading,
	background,
	description,
	items,
}: Props ) {
	return (
		<PageSection
			icon={ icon }
			heading={ heading }
			subheading={ subheading }
			background={ background }
			description={ description }
		>
			<HostingOverviewFeatures items={ items } />
		</PageSection>
	);
}
