import { ReactNode } from 'react';

const Panel = ( {
	label,
	description,
	children,
}: {
	children: ReactNode;
	label?: string;
	description?: string;
} ) => {
	return (
		<div key="panel" className="pattern-list-panel__wrapper">
			<div className="pattern-list-panel__title">{ label }</div>
			<div className="pattern-list-panel__description">{ description }</div>
			{ children }
		</div>
	);
};

export default Panel;
