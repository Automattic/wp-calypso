/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ValuesType } from 'utility-types';

export const fontPairings = [
	[ 'Cabin', 'Raleway' ],
	[ 'Chivo', 'OpenSans' ],
	[ 'Playfair', 'FiraSans' ],
	[ 'Arvo', 'Montserrat' ],
	[ 'SpaceMono', 'Roboto' ],
] as const;

interface Props {
	onSelect: ( selection: ValuesType< typeof fontPairings > ) => void;
	selected: ValuesType< typeof fontPairings >;
}
const FontSelect: React.FunctionComponent< Props > = ( { onSelect, selected } ) => (
	<div className="style-preview__font-options">
		<ul>
			{ fontPairings.map( fonts => {
				const [ a, b ] = fonts;
				const isSelected = fonts === selected;
				return (
					<li key={ fonts.join() }>
						<Button onClick={ () => onSelect( fonts ) }>
							{ a } / { b }
							{ isSelected && '*' }
						</Button>
					</li>
				);
			} ) }
		</ul>
	</div>
);

export default FontSelect;
