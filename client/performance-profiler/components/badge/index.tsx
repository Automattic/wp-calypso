import React from 'react';

import './style.scss';

interface BadgeProps {
	text?: string;
}

export const Badge: React.FC< BadgeProps > = ( { text = 'WordPress Page Speed Test' } ) => {
	return (
		<div className="badge-container">
			<h1>{ text }</h1>
		</div>
	);
};
