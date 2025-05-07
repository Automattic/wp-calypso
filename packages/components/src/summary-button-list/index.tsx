import { __experimentalVStack as VStack, Card } from '@wordpress/components';
import type { SummaryButtonListProps } from './types';

function SummaryButtonList( { title, children }: SummaryButtonListProps ) {
	return (
		<div className="summary-button-list">
			<h3>{ title }</h3>
			<Card>
				<VStack>{ children }</VStack>
			</Card>
		</div>
	);
}

/**
 * This is a WIP component.
 */
export default SummaryButtonList;
