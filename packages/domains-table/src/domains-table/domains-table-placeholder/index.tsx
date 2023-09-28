import { LoadingPlaceholder } from '@automattic/components';
import classnames from 'classnames';
import type { ComponentProps } from 'react';
import './style.scss';

export function DomainsTablePlaceholder( {
	className,
	...rest
}: ComponentProps< typeof LoadingPlaceholder > ) {
	return (
		<LoadingPlaceholder
			className={ classnames( 'domains-table-placeholder', className ) }
			{ ...rest }
		/>
	);
}
