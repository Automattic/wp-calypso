import { Card } from '@automattic/components';
import classNames from 'classnames';
import type { ReactNode } from 'react';

import './style.scss';

interface Props {
	header: ReactNode;
	children: ReactNode;
	emptyContent?: ReactNode;
	isEnabled?: boolean;
	onClick?: () => void;
	href?: string;
}

export default function ExpandedCard( {
	header,
	children,
	isEnabled = true,
	emptyContent,
	onClick,
	href,
}: Props ) {
	// Trigger click event when pressing Enter or Space
	const handleOnKeyDown = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			onClick?.();
		}
	};

	const props = {
		href,
		compact: true,
		showLinkIcon: false,
		className: classNames( 'expanded-card', {
			'expanded-card__not-enabled': ! isEnabled,
			'expanded-card__clickable': onClick,
		} ),
		// Add click handlers if onClick is provided
		...( onClick && {
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
