import React, { ReactNode } from 'react';

export interface JetpackInstructionListProps {
	items: ReactNode[];
}

const JetpackInstructionList: React.FC< JetpackInstructionListProps > = ( { items } ) => {
	return (
		<ol className="jetpack-instruction-list">
			{ items.map( ( item, index ) => (
				<li className="jetpack-instruction-list__item" key={ index }>
					<span>{ item }</span>
				</li>
			) ) }
		</ol>
	);
};

export default JetpackInstructionList;
