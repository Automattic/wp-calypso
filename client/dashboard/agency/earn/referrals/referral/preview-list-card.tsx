import { Card, CardHeader, CardBody } from '../../../../components/card';
import { SectionHeader } from '../../../../components/section-header';
import { SummaryButtonCardFooter } from '../../../../components/summary-button-card-footer';
import { Text } from '../../../../components/text';
import type { ReactNode } from 'react';

import './preview-list-card.scss';

interface PreviewListCardProps {
	title: string;
	isEmpty: boolean;
	emptyText: string;
	seeAllTitle: string;
	seeAllHref: string;
	children: ReactNode;
}

export default function PreviewListCard( {
	title,
	isEmpty,
	emptyText,
	seeAllTitle,
	seeAllHref,
	children,
}: PreviewListCardProps ) {
	return (
		<Card className="referrals-preview-list-card">
			<CardHeader>
				<SectionHeader title={ title } level={ 3 } />
			</CardHeader>
			<CardBody>{ isEmpty ? <Text variant="muted">{ emptyText }</Text> : children }</CardBody>
			{ ! isEmpty && (
				<SummaryButtonCardFooter title={ seeAllTitle } href={ seeAllHref } density="medium" />
			) }
		</Card>
	);
}
