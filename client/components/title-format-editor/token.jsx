import React from 'react';

export const Token = props => {
	const style = {
		borderRadius: '3px',
		backgroundColor: '#08c',
		marginLeft: '1px',
		marginRight: '1px',
		padding: '2px',
		color: '#fff'
	};

	return (
		<span style={ style }>{ props.children }</span>
	);
};

export default Token;
