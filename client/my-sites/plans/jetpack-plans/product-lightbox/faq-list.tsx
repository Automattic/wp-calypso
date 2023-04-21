import { FAQ } from '@automattic/calypso-products';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FoldableFAQ from 'calypso/components/foldable-faq';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type FAQListProps = { items?: FAQ[] };

const FAQList: React.FC< FAQListProps > = ( { items } ) => {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	const onToggle = useCallback(
		( faqArgs: { id: string; isExpanded: boolean } ) => {
			const { id, isExpanded } = faqArgs;
			const tracksArgs = {
				site_id: siteId,
				faq_id: id,
			};

			dispatch(
				recordTracksEvent(
					isExpanded ? 'calypso_plans_faq_open' : 'calypso_plans_faq_closed',
					tracksArgs
				)
			);
		},
		[ siteId, dispatch ]
	);

	if ( ! items || ! items.length ) {
		return null;
	}

	return (
		<ul>
			{ items.map( ( item ) => (
				<li key={ item.id }>
					<FoldableFAQ id={ item.id } question={ item.question } onToggle={ onToggle }>
						{ item.answer }
					</FoldableFAQ>
				</li>
			) ) }
		</ul>
	);
};
export default FAQList;
