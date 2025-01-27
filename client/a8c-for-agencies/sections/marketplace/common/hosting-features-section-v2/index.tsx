import { Card } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import PageSection, { PageSectionProps } from 'calypso/a8c-for-agencies/components/page-section';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';

import './style.scss';

type Props = Omit< PageSectionProps, 'children' > & {
	features: {
		icon: JSX.Element;
		title: string;
		items: string[];
	}[];
};

function FeatureCard( {
	title,
	icon,
	items,
}: {
	title: string;
	icon: JSX.Element;
	items: string[];
} ) {
	return (
		<Card className="hosting-features-section-v2__card">
			<div className="hosting-features-section-v2__card-header">
				<Icon icon={ icon } />
				<h2 className="hosting-features-section-v2__card-title">{ title }</h2>
			</div>

			<SimpleList className="hosting-features-section-v2__card-list" items={ items } />
		</Card>
	);
}

export default function HostingFeaturesSectionV2( {
	icon,
	heading,
	subheading,
	background,
	description,
	features,
}: Props ) {
	return (
		<PageSection
			className="hosting-features-section-v2"
			icon={ icon }
			heading={ heading }
			subheading={ subheading }
			background={ background }
			description={ description }
		>
			<div className="hosting-features-section-v2__cards">
				{ features.map( ( feature, index ) => {
					return (
						<FeatureCard
							key={ `feature-card-${ index }` }
							icon={ feature.icon }
							title={ feature.title }
							items={ feature.items }
						/>
					);
				} ) }
			</div>
		</PageSection>
	);
}
