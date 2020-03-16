/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { ValuesType } from 'utility-types';

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
		<ul>
			{ fontPairings.map( fonts => {
				const [
					{ title: a, fontFamily: fontFamilyA },
					{ title: b, fontFamily: fontFamilyB },
				] = fonts;
				const isSelected = fonts === selected;

				return (
					<li key={ a + b }>
						<Button onClick={ () => onSelect( fonts ) }>
							<span style={ { fontFamily: fontFamilyA, fontWeight: 700 } }>{ a }</span>
							&nbsp;/&nbsp;
							<span style={ { fontFamily: fontFamilyB } }>{ b }</span>
							{ isSelected && '\u00a0*' }
						</Button>
					</li>
				);
			} ) }
		</ul>
	</div>
);

export default FontSelect;
