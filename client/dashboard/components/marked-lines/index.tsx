import clsx from 'clsx';
import './style.scss';

interface MarkedLinesProps {
	/**
	 * Provides the line content and mark ranges
	 */
	context: {
		marks?: Record< string, [ number, number ][] >;
		[ lineNumber: string ]: string | Record< string, [ number, number ][] > | undefined;
	};
}

/**
 * Surrounds a text string in a <mark>
 * Just a small helper function
 * @example
 * mark( 'be kind' ) =>
 *   <mark key="be kind" className="marked-lines__mark">be kind</mark>
 * @param text the string to mark
 * @returns JSX.Element
 */
function mark( text: string ) {
	return (
		<mark key={ text } className="marked-lines__mark">
			{ text }
		</mark>
	);
}

/**
 * Translates marked-file context input
 * into React component output
 * @example
 * const marks = [ [ 2, 4 ], [ 5, 9 ] ]
 * const content = '->^^-_____<--'
 * markup( marks, content ) === [ '->', <mark>{ '^^' }</mark>, '-', <mark>{ '_____' }</mark>, '<--' ]
 * @param marks spanning indices of text to mark, values in UCS-2 code units
 * @param content the plaintext content to mark
 * @returns list of output text nodes and mark elements or plain string output
 */
function markup( marks: [ number, number ][], content: string ): ( string | JSX.Element )[] {
	const [ finalOutput, finalLast ] = marks.reduce(
		(
			[ output, lastIndex ]: [ ( string | JSX.Element )[], number ],
			[ markStart, markEnd ]: [ number, number ]
		) => {
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
}

export function MarkedLines( { context }: MarkedLinesProps ) {
	const { marks = {}, ...lines } = context;

	return (
		<div className="marked-lines">
			<div className="marked-lines__line-numbers">
				{ Object.keys( lines ).map( ( lineNumber ) => {
					const hasMarks = marks.hasOwnProperty( lineNumber );

					return (
						<div
							key={ lineNumber }
							className={ clsx( 'marked-lines__line-number', {
								'marked-lines__marked-line': hasMarks,
							} ) }
						>
							{ lineNumber }
						</div>
					);
				} ) }
			</div>
			<div className="marked-lines__lines">
				{ Object.entries( lines ).map( ( [ lineNumber, content ] ) => {
					const hasMarks = marks.hasOwnProperty( lineNumber );
					let displayContent = content as string;

					if ( displayContent === '' ) {
						displayContent = ' ';
					}

					return (
						<div
							key={ lineNumber }
							className={ clsx( 'marked-lines__line', {
								'marked-lines__marked-line': hasMarks,
							} ) }
						>
							{ hasMarks ? markup( marks[ lineNumber ], displayContent ) : displayContent }
						</div>
					);
				} ) }
			</div>
		</div>
	);
}

export default MarkedLines;
