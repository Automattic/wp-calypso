import { JetpackFAQ } from '@automattic/calypso-products';
import FoldableFAQ from 'calypso/components/foldable-faq';

type FAQListProps = { items?: JetpackFAQ[] };

const FAQList: React.FC< FAQListProps > = ( { items } ) => {
	if ( ! items || ! items.length ) {
		return null;
	}

	return (
		<ul>
			{ items.map( ( item, index ) => (
				<li key={ index }>
					<FoldableFAQ id={ `faq-${ index }` } question={ item.question }>
						{ item.answer }
					</FoldableFAQ>
				</li>
			) ) }
		</ul>
	);
};
export default FAQList;
