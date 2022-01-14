import {
	JETPACK_SECURITY_CATEGORY,
	JETPACK_PERFORMANCE_CATEGORY,
	JETPACK_GROWTH_CATEGORY,
	JETPACK_PRODUCT_CATEGORIES,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, useCallback, useEffect } from 'react';
import CategoryFilterItem from './item';
import type { JetpackProductCategory } from '@automattic/calypso-products';

import './style.scss';

type Props = {
	className?: string;
	defaultValue?: JetpackProductCategory;
	onChange: ( category: JetpackProductCategory ) => void;
};

const targetify = ( str: string ): string =>
	`#${ encodeURIComponent( str.trim().toLowerCase().replace( /\s+/g, '-' ) ) }`;

const CategoryFilter: React.FC< Props > = ( { className, defaultValue, onChange } ) => {
	const [ value, setValue ] = useState< JetpackProductCategory | undefined >( defaultValue );
	const translate = useTranslate();
	const translations = useMemo(
		() => ( {
			[ JETPACK_SECURITY_CATEGORY ]: translate( 'Security', {
				comment: 'Filter category for Jetpack products',
			} ),
			[ JETPACK_PERFORMANCE_CATEGORY ]: translate( 'Performance', {
				comment: 'Filter category for Jetpack products',
			} ),
			[ JETPACK_GROWTH_CATEGORY ]: translate( 'Growth', {
				comment: 'Filter category for Jetpack products',
			} ),
		} ),
		[ translate ]
	);
	const targets = useMemo(
		() => ( {
			[ JETPACK_SECURITY_CATEGORY ]: targetify(
				translations[ JETPACK_SECURITY_CATEGORY ] as string
			),
			[ JETPACK_PERFORMANCE_CATEGORY ]: targetify(
				translations[ JETPACK_PERFORMANCE_CATEGORY ] as string
			),
			[ JETPACK_GROWTH_CATEGORY ]: targetify( translations[ JETPACK_GROWTH_CATEGORY ] as string ),
		} ),
		[ translations ]
	);
	const onClick = useCallback( ( value ) => setValue( value ), [ setValue ] );

	useEffect( () => {
		const targetValue = Object.keys( targets ).find(
			( key ) => targets[ key as JetpackProductCategory ] === window.location.hash
		);

		if ( targetValue ) {
			setValue( targetValue as JetpackProductCategory );
		}
	}, [] );

	useEffect( () => {
		if ( value ) {
			onChange( value );
		}
	}, [ onChange, value ] );

	return (
		<ul className={ classNames( 'category-filter', className ) }>
			{ JETPACK_PRODUCT_CATEGORIES.map( ( cat ) => (
				<li key={ cat }>
					<CategoryFilterItem
						value={ cat }
						text={ translations[ cat ] }
						target={ targets[ cat ] }
						isSelected={ cat === value }
						onClick={ onClick }
					/>
				</li>
			) ) }
		</ul>
	);
};

export default CategoryFilter;
