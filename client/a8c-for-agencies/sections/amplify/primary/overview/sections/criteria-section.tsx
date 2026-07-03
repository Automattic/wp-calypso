import {
	Card,
	CardBody,
	__experimentalGrid as Grid,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import type { ReactNode } from 'react';

import './criteria-section.scss';

export type CriteriaStat = {
	num: string;
	label: string;
};

export type Criterion = {
	id: string;
	num: string;
	title: string;
	summary: string;
};

type Props = {
	eyebrow: string;
	title: ReactNode;
	intro: string;
	stats: CriteriaStat[];
	criteria: Criterion[];
};

export default function AmplifyCriteriaSection( {
	eyebrow,
	title,
	intro,
	stats,
	criteria,
}: Props ) {
	return (
		<VStack spacing={ 8 }>
			<VStack spacing={ 4 }>
				<Text upperCase variant="muted" size={ 11 } weight={ 600 } letterSpacing="1px">
					{ eyebrow }
				</Text>
				<Heading level={ 2 }>{ title }</Heading>
				<Text className="amplify-criteria-intro" variant="muted">
					{ intro }
				</Text>
			</VStack>

			<Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={ 6 }>
				{ stats.map( ( stat ) => (
					<Card key={ stat.label } size="small">
						<CardBody>
							<VStack spacing={ 1 }>
								<Text size={ 28 } weight={ 700 } color="var(--color-primary)">
									{ stat.num }
								</Text>
								<Text variant="muted">{ stat.label }</Text>
							</VStack>
						</CardBody>
					</Card>
				) ) }
			</Grid>

			<Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={ 4 }>
				{ criteria.map( ( criterion ) => (
					<Card key={ criterion.id } size="small">
						<CardBody>
							<VStack spacing={ 2 }>
								<Text weight={ 600 } color="var(--color-primary)">
									{ criterion.num }
								</Text>
								<Heading level={ 3 } size={ 16 }>
									{ criterion.title }
								</Heading>
								<Text variant="muted">{ criterion.summary }</Text>
							</VStack>
						</CardBody>
					</Card>
				) ) }
			</Grid>
		</VStack>
	);
}
