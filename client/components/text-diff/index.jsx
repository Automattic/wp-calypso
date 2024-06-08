import clsx from 'clsx';
import { isEmpty, map } from 'lodash';
import PropTypes from 'prop-types';

import './style.scss';

const addLinesToOperations = ( operations ) => {
	if ( ! Array.isArray( operations ) || isEmpty( operations ) ) {
		return operations;
	}
	return operations.join( '\n\n' );
};

const renderOperation = ( operation, operationIndex, splitLines ) => {
	const { orig, final, value, op } = operation;
	const content = orig || final || value;

	const classnames = clsx( {
		'text-diff__additions': op === 'add',
		'text-diff__context': op === 'copy',
		'text-diff__deletions': op === 'del',
	} );

	return (
		<span className={ classnames } key={ operationIndex }>
			{ splitLines ? addLinesToOperations( content ) : content }
		</span>
	);
};

const TextDiff = ( { operations, splitLines } ) =>
	map( operations, ( operation, operationIndex ) =>
		renderOperation( operation, operationIndex, splitLines )
	);

TextDiff.propTypes = {
	operations: PropTypes.arrayOf(
		PropTypes.shape( {
			op: PropTypes.oneOf( [ 'add', 'copy', 'del' ] ),
			value: PropTypes.string.isRequired,
		} )
	),
	splitLines: PropTypes.bool,
};

export default TextDiff;
