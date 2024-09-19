import { Popover } from '@automattic/components';
import clsx from 'clsx';
import { omit } from 'lodash';
import './style.scss';

const ReaderPopover = ( props ) => {
	const classes = clsx( 'reader-popover', props.className );
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
