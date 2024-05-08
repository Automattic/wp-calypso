import { LoadingPlaceholder } from '@automattic/components';
import clsx from 'clsx';
import type { ComponentProps } from 'react';
import './style.scss';

interface DomainsTablePlaceholderProps extends ComponentProps< typeof LoadingPlaceholder > {
	isHeader?: boolean;
}

export function DomainsTablePlaceholder( {
	className,
	isHeader,
	...rest
}: DomainsTablePlaceholderProps ) {
	return (
		<LoadingPlaceholder
			className={ clsx( 'domains-table-placeholder', { 'is-header': isHeader }, className ) }
			{ ...rest }
		/>
	);
}
