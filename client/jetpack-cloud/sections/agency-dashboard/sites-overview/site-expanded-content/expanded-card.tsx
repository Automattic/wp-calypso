import { Card } from '@automattic/components';
import classNames from 'classnames';
import type { ReactNode } from 'react';

import './style.scss';

interface Props {
	header?: ReactNode;
	children?: ReactNode;
	emptyContent?: ReactNode;
	isEnabled?: boolean;
	onClick?: () => void;
	href?: string;
	isLoading?: boolean;
}

export default function ExpandedCard( {
	header,
	children,
	isEnabled = true,
	emptyContent,
	onClick,
	href,
	isLoading,
}: Props ) {
	// Trigger click event when pressing Enter or Space
	const handleOnKeyDown = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			onClick?.();
		}
	};

	const isClickable = !! onClick && ! isLoading;

	const props = {
		href,
		compact: true,
		showLinkIcon: false,
		className: classNames( 'expanded-card', {
			'expanded-card__not-enabled': ! isEnabled,
			'expanded-card__clickable': isClickable,
			'expanded-card__loading': isLoading,
		} ),
		// Add click handlers if onClick is provided
		...( isClickable && {
			role: 'button',
			tabIndex: 0,
			onKeyDown: handleOnKeyDown,
			onClick: onClick,
		} ),
	};

	return (
		<Card { ...props }>
			{ isEnabled ? (
				<>
					<div className="expanded-card__header">{ header }</div>
					{ children }
				</>
			) : (
				<div className="expanded-card__empty-content">
					<div>{ emptyContent }</div>
				</div>
			) }
		</Card>
	);
}
