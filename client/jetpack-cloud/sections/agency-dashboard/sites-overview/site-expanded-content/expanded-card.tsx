import { Card } from '@automattic/components';
import clsx from 'clsx';
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
	hasError?: boolean;
}

export default function ExpandedCard( {
	header,
	children,
	isEnabled = true,
	emptyContent,
	onClick,
	href,
	isLoading,
	hasError,
}: Props ) {
	// Trigger click event when pressing Enter or Space
	const handleOnKeyDown = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			onClick?.();
		}
	};

	const isClickable = !! onClick && ! isLoading && ! hasError;

	const props = {
		href,
		compact: true,
		showLinkIcon: false,
		className: clsx( 'expanded-card', {
			'expanded-card__not-enabled': ! isEnabled,
			'expanded-card__clickable': isClickable,
			'expanded-card__loading': isLoading,
			'expanded-card__error': ! isEnabled && hasError, // If the card is not enabled and has an error, show the error state
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
		<Card data-testid="expanded-card" { ...props }>
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
