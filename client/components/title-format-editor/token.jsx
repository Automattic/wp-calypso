/** @format */
import React from 'react';

export const Token = props => {
	const { onClick } = props;

	// please ignore the formatting below
	// if we allow spaces it will mess up
	// the way the component renders in
	// the draft-js editor
	return (
		<span className="title-format-editor__token" onClick={ onClick( props.entityKey ) }>
			{ props.children }
		</span>
	);
};

export default Token;
