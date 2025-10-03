import { Gridicon, Button, FoldableCard } from '@automattic/components';
import { OfferingItemProps } from './types';

const OfferingItem: React.FC< OfferingItemProps > = ( {
	title,
	titleIcon,
	description,
	highlights,
	buttonTitle,
	expanded,
	clickableHeader = true,
	actionHandler,
	href,
} ) => {
	const header = (
		<div>
			<div className="a4a-offering-item__title-container">
				{ titleIcon }
				<h3 className="a4a-offering-item__title">{ title }</h3>
			</div>
		</div>
	);

	return (
		<FoldableCard
			className="a4a-offering-item__card"
			header={ header }
			expanded={ expanded }
			clickableHeader={ clickableHeader }
		>
			<p className="a4a-offering-item__description">{ description }</p>
			<ul className="a4a-offering-item__card-list">
				{ highlights.map( ( highlightItemText ) => (
					<li className="a4a-offering-item__card-list-item" key={ highlightItemText }>
						<div className="a4a-offering-item__icon-container">
							<Gridicon className="a4a-offering-item__gridicon" icon="checkmark" size={ 18 } />
						</div>
						<span className="a4a-offering-item__text">{ highlightItemText }</span>
					</li>
				) ) }
			</ul>
			<Button className="a4a-offering-item__button" onClick={ actionHandler } href={ href } primary>
				{ buttonTitle }
			</Button>
		</FoldableCard>
	);
};

export default OfferingItem;
