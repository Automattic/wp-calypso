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

const CategoryFilter: React.FC< Props > = ( { className, defaultValue, onChange } ) => {
	const [ value, setValue ] = useState< JetpackProductCategory | undefined >( defaultValue );
	const translate = useTranslate();
	const translations = useMemo(
		() => ( {
			[ JETPACK_SECURITY_CATEGORY ]: translate( 'Security' ),
			[ JETPACK_PERFORMANCE_CATEGORY ]: translate( 'Performance' ),
			[ JETPACK_GROWTH_CATEGORY ]: translate( 'Growth' ),
		} ),
		[ translate ]
	);
	const targets = useMemo(
		() => ( {
			[ JETPACK_SECURITY_CATEGORY ]: translate( 'security' ) as string,
			[ JETPACK_PERFORMANCE_CATEGORY ]: translate( 'performance' ) as string,
			[ JETPACK_GROWTH_CATEGORY ]: translate( 'growth' ) as string,
		} ),
		[ translate ]
	);
	const onClick = useCallback( ( value ) => setValue( value ), [ setValue ] );

	useEffect( () => {
		if ( ! value ) {
			const targetValue = Object.keys( targets ).find(
				( key ) =>
					targets[ key as JetpackProductCategory ] === window.location.hash.replace( '#', '' )
			);

			if ( targetValue ) {
				setValue( targetValue as JetpackProductCategory );
			}
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
						target={ targets[ cat ] as string }
						isSelected={ cat === value }
						onClick={ onClick }
					/>
				</li>
			) ) }
		</ul>
	);
};

export default CategoryFilter;
