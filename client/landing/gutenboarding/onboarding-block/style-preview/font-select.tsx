/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { ValuesType } from 'utility-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { fontPairings } from '../../constants';

interface Props {
	onSelect: ( selection: ValuesType< typeof fontPairings > ) => void;
	selected: ValuesType< typeof fontPairings >;
}
const FontSelect: React.FunctionComponent< Props > = ( { onSelect, selected } ) => (
	<div className="style-preview__font-options">
		{ fontPairings.map( fonts => {
			const isSelected = fonts === selected;
			const [
				{ title: a, fontFamily: fontFamilyA },
				{ title: b, fontFamily: fontFamilyB },
			] = fonts;

			return (
				<Button
					className={ classnames( 'style-preview__font-option', { 'is-selected': isSelected } ) }
					onClick={ () => onSelect( fonts ) }
					key={ a + b }
				>
					<span style={ { fontFamily: fontFamilyA, fontWeight: 700 } }>{ a }</span>
					&nbsp;/&nbsp;
					<span style={ { fontFamily: fontFamilyB } }>{ b }</span>
				</Button>
			);
		} ) }
	</div>
);

export default FontSelect;
