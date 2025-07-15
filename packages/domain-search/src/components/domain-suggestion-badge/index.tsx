import { __experimentalText as Text } from '@wordpress/components';
import clsx from 'clsx';
import { ReactNode } from 'react';
import { BadgePopover } from './badge-popover';

import './style.scss';

interface DomainSuggestionBadgeProps {
	children: ReactNode;
	variation?: 'warning';
	popover?: ReactNode;
}

export const DomainSuggestionBadge = ( {
	children,
	variation,
	popover,
}: DomainSuggestionBadgeProps ) => {
	return (
		<Text
			size={ 12 }
			lineHeight={ 1 }
			className={ clsx(
				'domain-suggestion-badge',
				variation && `domain-suggestion-badge--${ variation }`
			) }
		>
			{ children }
			{ popover && <BadgePopover>{ popover }</BadgePopover> }
		</Text>
	);
};
