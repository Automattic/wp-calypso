/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isArray, isEmpty, map, partialRight } from 'lodash';

const addLinesToChanges = changes => {
	if ( ! isArray( changes ) || isEmpty( changes ) ) {
		return changes;
	}
	return changes.join( '\n\n' );
};

const renderChange = ( change, changeIndex, splitLines ) => {
	const { orig, final, value, op } = change;
	const content = orig || final || value;

	const classnames = classNames( {
		'text-diff__additions': op === 'add',
		'text-diff__context': op === 'copy',
		'text-diff__deletions': op === 'del',
	} );

	return (
		<span className={ classnames } key={ changeIndex }>
			{ splitLines ? addLinesToChanges( content ) : content }
		</span>
	);
};

const renderSplitLineChange = partialRight( renderChange, true );

const DiffChanges = ( { changes, splitLines } ) =>
	map( changes, splitLines ? renderSplitLineChange : renderChange );

DiffChanges.propTypes = {
	changes: PropTypes.arrayOf(
		PropTypes.shape( {
			op: PropTypes.oneOf( [ 'add', 'copy', 'del' ] ),
			value: PropTypes.string.isRequired,
		} )
	),
	splitLines: PropTypes.bool,
};

export default DiffChanges;
