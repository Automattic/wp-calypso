/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import classnames from 'classnames';
import { Popover, Button } from '@wordpress/components';
import { info } from '@wordpress/icons';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	children: React.ReactNode;
	className?: string;
	id?: string;
	position?:
		| 'top left'
		| 'top right'
		| 'top center'
		| 'middle left'
		| 'middle right'
		| 'middle center'
		| 'bottom left'
		| 'bottom right'
		| 'bottom center';
	noArrow?: boolean;
}

const InfoTooltip: FunctionComponent< Props > = ( {
	children,
	className,
	id,
	position = 'bottom center',
	noArrow = true,
} ) => {
	const [ showTooltip, setShowTooltip ] = useState< boolean >( false );
	const handleClick = () => {
		setShowTooltip( ! showTooltip );
	};
	const handleClose = () => {
		setShowTooltip( false );
	};

	return (
		<Button
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			icon={ info }
			onClick={ handleClick }
			className="info-tooltip"
			data-testid="info-tooltip"
		>
			{ showTooltip && (
				<Popover
					id={ id }
					className={ classnames( 'info-tooltip__content', className ) }
					onClose={ handleClose }
					position={ position }
					noArrow={ noArrow }
				>
					{ children }
				</Popover>
			) }
		</Button>
	);
};

export default InfoTooltip;
