import HostingOverviewFeatures from '../hosting-overview-features';
import HostingSection, { HostingSectionProps } from '../hosting-section';

type Props = Omit< HostingSectionProps, 'children' > & {
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
		<HostingSection
			icon={ icon }
			heading={ heading }
			subheading={ subheading }
			background={ background }
			description={ description }
		>
			<HostingOverviewFeatures items={ items } />
		</HostingSection>
	);
}
