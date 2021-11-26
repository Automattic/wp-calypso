import { Gridicon } from '@automattic/components';
import { ReactElement, ReactNode } from 'react';
import './style.scss';

interface Card {
	title: string;
	icon?: string;
	children: ReactNode;
}

export default function SignupCard( {
	title,
	icon = 'domains',
	children,
}: Card ): ReactElement | null {
	return (
		<div className="signup-card">
			<div className="signup-card__title">
				<Gridicon icon={ icon } size={ 24 } />
				<h2>{ title }</h2>
			</div>
			<div className="signup-card__body">{ children }</div>
		</div>
	);
}
