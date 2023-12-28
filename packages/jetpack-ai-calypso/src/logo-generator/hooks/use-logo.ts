/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store';
/**
 * Types
 */
import type { Selectors } from '../store/types';

const useLogo = () => {
	const { setSelectedLogoIndex } = useDispatch( STORE_NAME );

	const { logos, selectedLogo, siteDetails } = useSelect( ( select ) => {
		const selectors: Selectors = select( STORE_NAME );
		return {
			logos: selectors.getLogos(),
			selectedLogo: selectors.getSelectedLogo(),
			siteDetails: selectors.getSiteDetails(),
		};
	}, [] );
	const { ID = null, name = null, description = null } = siteDetails;

	return {
		setSelectedLogoIndex,
		logos,
		selectedLogo,
		site: {
			id: ID,
			name,
			description,
		},
	};
};

export default useLogo;
