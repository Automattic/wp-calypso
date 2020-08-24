/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';

/**
 * Style dependencies
 */
import './style.scss';

const ReaderPopover = ( props ) => {
	const classes = classnames( 'reader-popover', props.className );
	const popoverProps = omit( props, 'className' );
	return (
		<Popover className={ classes } { ...popoverProps }>
			<div className="reader-popover__wrapper">
				{ props.popoverTitle && <h3 className="reader-popover__header">{ props.popoverTitle }</h3> }
				{ props.children }
			</div>
		</Popover>
	);
};

export default ReaderPopover;
