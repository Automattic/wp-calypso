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

	const onFaqToggle = useCallback(
		( faqArgs: { id: string; buttonId: string; isExpanded: boolean; height: number } ) => {
			const { id, buttonId, isExpanded } = faqArgs;
			const tracksArgs = {
				site_id: siteId,
				faq_id: id,
			};

			const removeHash = () => {
				history.replaceState( '', document.title, location.pathname + location.search );
			};

			// Add expanded FAQ buttonId to the URL hash
			const addHash = () => {
				history.replaceState(
					'',
					document.title,
					location.pathname + location.search + `#${ buttonId }`
				);
			};

			if ( isExpanded ) {
				addHash();
				// FAQ opened
				dispatch( recordTracksEvent( 'calypso_plans_faq_open', tracksArgs ) );
			} else {
				removeHash();
				// FAQ closed
				dispatch( recordTracksEvent( 'calypso_plans_faq_closed', tracksArgs ) );
			}
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
					<FoldableFAQ id={ item.id } question={ item.question } onToggle={ onFaqToggle }>
						{ item.answer }
					</FoldableFAQ>
				</li>
			) ) }
		</ul>
	);
};
export default FAQList;
