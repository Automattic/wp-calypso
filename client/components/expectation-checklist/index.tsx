import './style.scss';

import { Gridicon } from '@automattic/components';
import { Card, CardBody } from '@wordpress/components';
import type { ReactNode } from 'react';

export type ExpectationChecklistItem = {
	icon: string;
	text: ReactNode;
};

/**
 * The “Here’s what to expect” card shown while a long server-side operation runs: a titled
 * list of short reassurances, each with an icon. Pure presentation — the caller owns the copy.
 */
export default function ExpectationChecklist( {
	title,
	items,
}: {
	title: ReactNode;
	items: ExpectationChecklistItem[];
} ) {
	return (
		<Card className="expectation-checklist">
			<CardBody>
				<div className="expectation-checklist__title">{ title }</div>
				<div className="expectation-checklist__items">
					{ items.map( ( item, index ) => (
						<div key={ index } className="expectation-checklist__item">
							<div className="expectation-checklist__item-icon">
								<Gridicon icon={ item.icon } size={ 16 } className="expectation-checklist__icon" />
							</div>
							<div className="expectation-checklist__item-text">{ item.text }</div>
						</div>
					) ) }
				</div>
			</CardBody>
		</Card>
	);
}
