import { __experimentalText as Text } from '@wordpress/components';
import clsx from 'clsx';

import './style.scss';

interface DomainSuggestionBadgeProps {
	children: React.ReactNode;
	variation?: 'warning';
}

export const DomainSuggestionBadge = ( { children, variation }: DomainSuggestionBadgeProps ) => {
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
		</Text>
	);
};
