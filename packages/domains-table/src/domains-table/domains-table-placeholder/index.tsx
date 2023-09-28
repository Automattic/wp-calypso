import { LoadingPlaceholder } from '@automattic/components';
import classnames from 'classnames';
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
			className={ classnames( 'domains-table-placeholder', { 'is-header': isHeader }, className ) }
			{ ...rest }
		/>
	);
}
