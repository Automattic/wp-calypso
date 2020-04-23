/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import classNames from 'classnames';
import { map } from 'lodash';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Surrounds a text string in a <mark>
 * Just a small helper function
 *
 * @example
 * mark( 'be kind' ) =>
 *   <mark key="be kind" className="marked-lines__mark">be kind</mark>
 *
 * @param {string} text the string to mark
 * @returns {React.Element} React <mark> Element
 */
const mark = ( text ) => (
	<mark key={ text } className="marked-lines__mark">
		{ text }
	</mark>
);

/**
 * Translates marked-file context input
 * into React component output
 *
 * @example
 * const marks = [ [ 2, 4 ], [ 5, 9 ] ]
 * const content = '->^^-_____<--'
 * markup( marks, content ) === [ '->', <mark>{ '^^' }</mark>, '-', <mark>{ '_____' }</mark>, '<--' ]
 *
 * @param {Array<Array<number>>} marks spanning indices of text to mark, values in UCS-2 code units
 * @param {string} content the plaintext content to mark
 * @returns {Array|string} list of output text nodes and mark elements or plain string output
 */
const markup = ( marks, content ) => {
	const [ finalOutput, finalLast ] = marks.reduce(
		( [ output, lastIndex ], [ markStart, markEnd ] ) => {
			// slice of input text specified by current mark ranges
			const slice = content.slice( markStart, markEnd );

			// if we have text before the first index then prepend it as well
			const next =
				markStart > lastIndex
					? [ content.slice( lastIndex, markStart ), mark( slice ) ]
					: [ mark( slice ) ];

			return [ [ ...output, ...next ], markEnd ];
		},
		[ [], 0 ]
	);

	// we may also have text after the last mark
	return finalLast < content.length ? [ ...finalOutput, content.slice( finalLast ) ] : finalOutput;
};

const MarkedLines = ( { context } ) => {
	const { marks, ...lines } = context;

	return (
		<div className="marked-lines">
			<div className="marked-lines__line-numbers">
				{ map( lines, ( content, lineNumber ) => {
					const hasMarks = marks.hasOwnProperty( lineNumber );

					return (
						<div
							key={ lineNumber }
							className={ classNames( 'marked-lines__line-number', {
								'marked-lines__marked-line': hasMarks,
							} ) }
						>
							{ lineNumber }
						</div>
					);
				} ) }
			</div>
			<div className="marked-lines__lines">
				{ map( lines, ( content, lineNumber ) => {
					const hasMarks = marks.hasOwnProperty( lineNumber );

					return (
						<div
							key={ lineNumber }
							className={ classNames( 'marked-lines__line', {
								'marked-lines__marked-line': hasMarks,
							} ) }
						>
							<Fragment>{ hasMarks ? markup( marks[ lineNumber ], content ) : content }</Fragment>
						</div>
					);
				} ) }
			</div>
		</div>
	);
};

export default MarkedLines;
