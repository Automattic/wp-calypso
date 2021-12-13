import classNames from 'classnames';
import { TranslateResult } from 'i18n-calypso';
import { useCallback } from 'react';
import type { JetpackProductCategory } from '@automattic/calypso-products';

type Props = {
	value: JetpackProductCategory;
	text: TranslateResult;
	target: string;
	isSelected?: boolean;
	onClick: ( value: JetpackProductCategory ) => void;
};

const CategoryFilterItem: React.FC< Props > = ( { value, text, target, isSelected, onClick } ) => {
	const cb = useCallback( () => onClick( value ), [ onClick, value ] );

	return (
		<a
			className={ classNames( 'category-filter__link', { 'is-selected': isSelected } ) }
			href={ target }
			onClick={ cb }
		>
			{ text }
		</a>
	);
};

export default CategoryFilterItem;
