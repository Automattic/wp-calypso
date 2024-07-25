import HostingOverviewFeatures from '../hosting-overview-features';
import HostingSection, { HostingSectionProps } from '../hosting-section';
import { BackgroundType2 } from '../hosting-section/backgrounds';

type Props = Omit< HostingSectionProps, 'children' > & {
	items: {
		icon: JSX.Element;
		title: string;
		description: string;
	}[];
};

export default function HostingFeaturesSection( {
	heading,
	subheading,
	background = BackgroundType2,
	description,
	items,
}: Props ) {
	return (
		<HostingSection
			heading={ heading }
			subheading={ subheading }
			background={ background }
			description={ description }
		>
			<HostingOverviewFeatures items={ items } />
		</HostingSection>
	);
}
