/**
 * External dependencies
 */
import React, { FunctionComponent, ReactNode } from 'react';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	'aria-label': string;
	href: string;
	onClick: () => void;
	children: ReactNode;
	external?: boolean;
	icon?: string;
}

const NoticeAction: FunctionComponent< Props > = ( {
	'aria-label': ariaLabel,
	href,
	onClick,
	children,
	external = false,
	icon,
} ) => {
	const attributes = {
		'aria-label': ariaLabel,
		className: 'notice__action',
		href: href,
		onClick: onClick,
	};

	if ( external ) {
		attributes.target = '_blank';
		attributes.rel = 'noopener noreferrer';
	}

	return (
		<a { ...attributes }>
			<span>{ children }</span>
			{ icon && <Gridicon icon={ icon } size={ 24 } /> }
			{ external && <Gridicon icon="external" size={ 24 } /> }
		</a>
	);
};

export default NoticeAction;
