/** @format */
/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { parsePatch } from 'diff';

const filename = ( { oldFileName, newFileName } ) => {
	const oldName = oldFileName.replace( /.+\//, '' );
	const newName = newFileName.replace( /.+\//, '' );

	return oldName !== newName ? `${ oldName } → ${ newName }` : oldName;
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
