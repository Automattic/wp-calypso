import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { getPreviewStylesFromVariation } from '../theme-style-variation-badges/utils';
import Iframe from './iframe';
import type { ThemeStyleVariation } from '../../types';

interface VariationProps {
	variation: ThemeStyleVariation;
}

const Variation: React.FC< VariationProps > = ( { variation } ) => {
	const translate = useTranslate();
	const styles = useMemo(
		() => variation && getPreviewStylesFromVariation( variation ),
		[ variation ]
	);

	if ( ! styles ) {
		return null;
	}

	return (
		<Iframe
			className="theme-preview-container__sidebar-variation-iframe"
			title={ translate( 'Style variation' ) }
		>
			{ styles.toString() }
		</Iframe>
	);
};

export default Variation;
