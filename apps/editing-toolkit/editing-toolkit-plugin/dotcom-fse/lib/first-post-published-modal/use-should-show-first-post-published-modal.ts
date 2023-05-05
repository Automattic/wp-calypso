import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { selectors as wpcomWelcomeGuideSelectors } from '../../../wpcom-block-editor-nux/src/store';
import type { SelectFromMap } from '@automattic/data-stores';

type WpcomWelcomeGuideSelectors = SelectFromMap< typeof wpcomWelcomeGuideSelectors >;

const useShouldShowFirstPostPublishedModal = () => {
	const { fetchShouldShowFirstPostPublishedModal } = useDispatch(
		'automattic/wpcom-welcome-guide'
	);

	useEffect( () => {
		fetchShouldShowFirstPostPublishedModal();
	}, [ fetchShouldShowFirstPostPublishedModal ] );

	return useSelect(
		( select ) =>
			(
				select( 'automattic/wpcom-welcome-guide' ) as WpcomWelcomeGuideSelectors
			 ).getShouldShowFirstPostPublishedModal(),
		[]
	);
};
export default useShouldShowFirstPostPublishedModal;
