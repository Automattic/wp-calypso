/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import classnames from 'classnames';
import { Popover } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';

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
		<>
			<button
				type="button"
				aria-haspopup
				data-testid="info-tooltip"
				onClick={ handleClick }
				className={ classnames( 'info-tooltip', className, {
					'is-active': showTooltip,
				} ) }
			>
				<Icon icon={ info } />
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
			</button>
		</>
	);
};

export default InfoTooltip;
