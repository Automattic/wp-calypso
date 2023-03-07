import { Card } from '@automattic/components';
import type { ReactNode } from 'react';

import './style.scss';

interface Props {
	header: ReactNode;
	children: ReactNode;
	emptyContent?: ReactNode;
	isEnabled?: boolean;
}

export default function ExpandedCard( {
	header,
	children,
	isEnabled = true,
	emptyContent,
}: Props ) {
	return (
		<Card className="expanded-card" compact>
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
