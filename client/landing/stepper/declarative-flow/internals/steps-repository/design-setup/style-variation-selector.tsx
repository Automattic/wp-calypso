import { Button } from '@automattic/components';

const StyleVariationSelector = ( { styleVariations, onSelectStyleVariation } ) => {
	return styleVariations.map( ( variation ) => (
		<Button key={ variation.slug } onClick={ () => onSelectStyleVariation( variation ) }>
			{ variation.title }
		</Button>
	) );
};

export default StyleVariationSelector;
