import { Card, CardBody } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { type TranslateResult } from 'i18n-calypso';
import './style.scss';

export interface ChecklistCardItem {
	icon: React.ReactElement;
	text: TranslateResult;
}

interface ChecklistCardProps {
	title: TranslateResult;
	items: ChecklistCardItem[];
}

export const ChecklistCard = ( { title, items }: ChecklistCardProps ) => {
	return (
		<Card className="checklist-card">
			<CardBody>
				<div className="checklist-card__title">{ title }</div>
				<div className="checklist-card__items">
					{ items.map( ( item, index ) => (
						<div key={ index } className="checklist-card__item">
							<div className="checklist-card__item-icon">
								<Icon icon={ item.icon } size={ 20 } />
							</div>
							<div className="checklist-card__item-text">{ item.text }</div>
						</div>
					) ) }
				</div>
			</CardBody>
		</Card>
	);
};
