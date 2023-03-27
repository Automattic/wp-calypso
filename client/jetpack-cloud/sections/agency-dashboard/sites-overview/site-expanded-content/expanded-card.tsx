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
}

export default function ExpandedCard( {
	header,
	children,
	isEnabled = true,
	emptyContent,
	onClick,
}: Props ) {
	return (
		<Card
			className={ classNames( 'expanded-card', { 'expanded-card__not-enabled': ! isEnabled } ) }
			compact
			onClick={ onClick }
		>
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
