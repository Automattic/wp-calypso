import OfferingItem from './offering-item';
import { OfferingCardProps } from './types';
import './style.scss';

const Offering: React.FC< OfferingCardProps > = ( { title, description, items, children } ) => {
	return (
		<div className="a4a-offering-card__wrapper">
			<h2 className="a4a-offering-card__title">{ title }</h2>
			<p className="a4a-offering-card__description">{ description }</p>
			{ children }
			{ items?.map( ( item ) => <OfferingItem key={ item.title } { ...item } /> ) }
		</div>
	);
};

export default Offering;
