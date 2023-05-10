import { FAQ } from '@automattic/calypso-products';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import FoldableFAQ from 'calypso/components/foldable-faq';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type Props = { items?: FAQ[] };

const LicenseLightboxFAQList: FunctionComponent< Props > = ( { items } ) => {
	const dispatch = useDispatch();

	const onToggle = useCallback(
		( faqArgs: { id: string; isExpanded: boolean } ) => {
			const { id, isExpanded } = faqArgs;
			const tracksArgs = {
				faq_id: id,
			};

			dispatch(
				recordTracksEvent(
					isExpanded ? 'calypso_partner_portal_faq_opened' : 'calypso_partner_portal_faq_closed',
					tracksArgs
				)
			);
		},
		[ dispatch ]
	);

	if ( ! items || ! items.length ) {
		return null;
	}

	return (
		<ul className="license-lightbox__faq-list">
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

export default LicenseLightboxFAQList;
