import { ReactElement, ReactNode } from 'react';

import './style.scss';

interface InfoLabelProps {
	children: ReactNode;
	label?: string;
	type?: string;
}

export default function InfoLabel( {
	children,
	label,
	type = 'info',
}: InfoLabelProps ): ReactElement | null {
	return (
		<div className={ `signup-banner signup-banner--${ type }` }>
			<div className="signup-banner__content">{ children }</div>
			{ label && <div className="signup-banner__label">{ label }</div> }
		</div>
	);
}
