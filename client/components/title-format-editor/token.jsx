import React from 'react';

export const Token = props => {
	const { onClick } = props;

	return (
		<div
			className="title-format-editor__token"
			onClick={ onClick( props.entityKey ) }
		>
			{ props.children }
			<div className="title-format-editor__token-close noticon noticon-close-alt" />
		</div>
	);
};

export default Token;
