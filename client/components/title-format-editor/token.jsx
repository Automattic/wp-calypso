import React from 'react';

export const Token = props => {
	return (
		<div className="title-format-editor__token">
			{ props.children }
			<div className="title-format-editor__token-close noticon noticon-close-alt" />
		</div>
	);
};

export default Token;
