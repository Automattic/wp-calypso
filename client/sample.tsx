import React from 'react';

export interface TextDisplayProps {
	text: string;
	className?: string;
}

export const TextDisplay: React.FC< TextDisplayProps > = ( { text, className = '' } ) => {
	return <div className={ `text-display ${ className }` }>{ text }</div>;
};
