/**
 * External dependencies
 */
import React from 'react';

export const Token = ( props ) => (
	/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
	<span className="title-format-editor__token" onClick={ props.onClick( props.entityKey ) }>
		{ props.children }
	</span>
	/* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
);

export default Token;
