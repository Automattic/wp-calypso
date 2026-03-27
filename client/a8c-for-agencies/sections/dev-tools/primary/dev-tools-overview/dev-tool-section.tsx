import { Badge } from '@automattic/ui';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

interface DevToolSectionProps {
	name: string;
	badge: string;
	tagline: string;
	description: string;
	features: string[];
	cta: {
		label: string;
		href: string;
		onClick?: () => void;
	};
	image: {
		src: string;
		alt: string;
	};
	hasBackground?: boolean;
}

export default function DevToolSection( {
	name,
	badge,
	tagline,
	description,
	features,
	cta,
	image,
	hasBackground = false,
}: DevToolSectionProps ) {
	return (
		<PageSectionColumns
			background={ hasBackground ? { color: 'var(--color-neutral-0)' } : undefined }
		>
			<PageSectionColumns.Column
				heading={
					<>
						<HStack alignment="left">
							<Heading level={ 3 }>{ name }</Heading>
							<Badge>{ badge }</Badge>
						</HStack>
						<Text className="dev-tools-overview__tagline" weight={ 500 }>
							{ tagline }
						</Text>
					</>
				}
			>
				<VStack className="dev-tools-overview__content" spacing={ 4 }>
					<Text size="body-large">{ preventWidows( description ) }</Text>
					<SimpleList className="dev-tools-overview__list" items={ features } />
					<Button variant="primary" href={ cta.href } target="_blank" onClick={ cta.onClick }>
						{ cta.label }
					</Button>
				</VStack>
			</PageSectionColumns.Column>
			<PageSectionColumns.Column alignCenter>
				<img src={ image.src } alt={ image.alt } />
			</PageSectionColumns.Column>
		</PageSectionColumns>
	);
}
