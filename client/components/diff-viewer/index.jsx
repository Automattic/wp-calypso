/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { parsePatch } from 'diff';

/**
 * Style dependencies
 */
import './style.scss';

const decompose = ( path ) => {
	const lastSlash = path.lastIndexOf( '/' );

	return lastSlash > -1 ? [ path.slice( 0, lastSlash ), path.slice( lastSlash ) ] : [ '', path ];
};

/**
 * Uses a heuristic to return proper file name indicators
 *
 * This function lists the filenames for the left and right
 * side of the diff in a single string.
 *
 * It searches for the longest shared prefix and returns
 * whatever remains after that. If the paths are identical
 * it only returns a single filename as we have detected
 * that the diff compares changes to only one file.
 *
 * An exception is made for `a/` and `b/` prefixes often
 * added by `git` and other utilities to separate the left
 * from the right when looking at the contents of a single
 * file over time.
 *
 * @param {string} oldFileName filename of left contents
 * @param {string} newFileName filename of right contents
 * @returns {Element} description of the file or files in the diff
 */
const filename = ( { oldFileName, newFileName } ) => {
	// if we think the diff utility added a bogus
	// prefix then cut it off
	const isLikelyPrefixed =
		'a' === oldFileName[ 0 ] &&
		'/' === oldFileName[ 1 ] &&
		'b' === newFileName[ 0 ] &&
		'/' === newFileName[ 1 ];

	const [ prev, next ] = isLikelyPrefixed
		? [ oldFileName.slice( 2 ), newFileName.slice( 2 ) ]
		: [ oldFileName, newFileName ];

	if ( prev === next ) {
		const [ base, name ] = decompose( prev );

		// it's the same file, return the single name
		return (
			<Fragment>
				{ base && <span className="diff-viewer__path-prefix">{ base }</span> }
				<span className="diff-viewer__path">{ name }</span>
			</Fragment>
		);
	}

	// find the longest shared path prefix
	const length = Math.max( prev.length, next.length );
	for ( let i = 0, slash = 0; i < length; i++ ) {
		if ( prev[ i ] === '/' && next[ i ] === '/' ) {
			slash = i;
		}

		if ( prev[ i ] !== next[ i ] ) {
			return (
				<Fragment>
					{ slash !== 0 && (
						<span className="diff-viewer__path-prefix">{ prev.slice( 0, slash ) }</span>
					) }
					<span className="diff-viewer__path">{ prev.slice( slash ) }</span>
					{ ' → ' }
					{ slash !== 0 && (
						<span className="diff-viewer__path-prefix">{ next.slice( 0, slash ) }</span>
					) }
					<span className="diff-viewer__path">{ next.slice( slash ) }</span>
				</Fragment>
			);
		}
	}

	// otherwise we have no shared prefix
	const [ prevBase, prevName ] = decompose( prev );
	const [ nextBase, nextName ] = decompose( next );

	return (
		<Fragment>
			{ prevBase && <span className="diff-viewer__path-prefix">{ prevBase }</span> }
			<span className="diff-viewer__path">{ prevName }</span>
			{ ' → ' }
			{ nextBase && <span className="diff-viewer__path-prefix">{ nextBase }</span> }
			<span className="diff-viewer__path">{ nextName }</span>
		</Fragment>
	);
};

export const DiffViewer = ( { diff } ) => (
	<div className="diff-viewer">
		{ parsePatch( diff ).map( ( file, fileIndex ) => (
			<Fragment key={ fileIndex }>
				<div key={ `file-${ fileIndex }` } className="diff-viewer__filename">
					{ filename( file ) }
				</div>
				<div key={ `diff-${ fileIndex }` } className="diff-viewer__file">
					<div key="left-numbers" className="diff-viewer__line-numbers">
						{ file.hunks.map( ( hunk, hunkIndex ) => {
							let lineOffset = 0;
							return hunk.lines.map( ( line, index ) => (
								<div key={ `${ hunkIndex }-${ index }` }>
									{ line[ 0 ] === '+' ? '\u00a0' : hunk.oldStart + lineOffset++ }
								</div>
							) );
						} ) }
					</div>
					<div key="right-numbers" className="diff-viewer__line-numbers">
						{ file.hunks.map( ( hunk, hunkIndex ) => {
							let lineOffset = 0;
							return hunk.lines.map( ( line, index ) => (
								<div key={ `${ hunkIndex }-${ index }` }>
									{ line[ 0 ] === '-' ? '\u00a0' : hunk.newStart + lineOffset++ }
								</div>
							) );
						} ) }
					</div>
					<div className="diff-viewer__lines">
						{ file.hunks.map( ( hunk, hunkIndex ) =>
							hunk.lines.map( ( line, index ) => {
								const output = line.slice( 1 ).replace( /^\s*$/, '\u00a0' );
								const key = `${ hunkIndex }-${ index }`;

								switch ( line[ 0 ] ) {
									case ' ':
										return <div key={ key }>{ output }</div>;

									case '-':
										return <del key={ key }>{ output }</del>;

									case '+':
										return <ins key={ key }>{ output }</ins>;
								}
							} )
						) }
					</div>
				</div>
			</Fragment>
		) ) }
	</div>
);

export default DiffViewer;
