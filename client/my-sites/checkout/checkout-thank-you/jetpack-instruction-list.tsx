import React, { ReactNode } from 'react';

export interface JetpackInstructionListProps {
	items: {
		id: number;
		content: ReactNode;
	}[];
}

const JetpackInstructionList: React.FC< JetpackInstructionListProps > = ( { items } ) => {
	return (
		<ol className="jetpack-instruction-list">
			{ items.map( ( { id, content } ) => (
				<li className="jetpack-instruction-list__item" key={ id }>
					<span>{ content }</span>
				</li>
			) ) }
		</ol>
	);
};

export default JetpackInstructionList;
