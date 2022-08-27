/* eslint-disable wpcalypso/no-unsafe-wp-apis */

import {
	__unstableIframe as Iframe,
	__unstableEditorStyles as EditorStyles,
} from '@wordpress/block-editor';
import { useMemo } from 'react';
import type { ThemeStyleVariation } from '../../types';

interface VariationProps {
	variation: ThemeStyleVariation;
}

const Variation: React.FC< VariationProps > = ( { variation } ) => {
	const styles = useMemo( () => {
		return {};
	}, [ variation ] );

	return (
		<Iframe
			className="theme-preview-container__sidebar-variation-iframe"
			head={ <EditorStyles styles={ styles } /> }
			tabIndex={ -1 }
		/>
	);
};

export default Variation;
