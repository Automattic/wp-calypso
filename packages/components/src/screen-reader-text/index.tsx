/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	children: React.ReactNode;
}

export default function ScreenReaderText( { children }: Props ): JSX.Element {
	return <span className="screen-reader-text">{ children }</span>;
}
