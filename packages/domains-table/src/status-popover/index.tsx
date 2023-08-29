import { Gridicon, Popover } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import React, { useState, useRef } from 'react';
import './style.scss';

type StatusPopoverProps = {
	children: React.ReactNode;
	className?: string;
};

export const StatusPopover = ( { children, className }: StatusPopoverProps ) => {
	const iconRef = useRef( null );
	const [ showPopover, setShowPopover ] = useState( false );
	const [ inPopover, setInPopover ] = useState( false );
	const { __ } = useI18n();

	const handleOnMouseEnterButton = () => {
		setShowPopover( true );
	};

	const handleOnMouseLeave = () => {
		setTimeout( () => {
			if ( inPopover ) {
				return;
			}

			setShowPopover( false );
		}, 250 );
	};

	const handleOnMouseEnterPopover = () => {
		setInPopover( true );
	};

	const handleOnMouseLeavePopover = () => {
		setInPopover( false );
		handleOnMouseLeave();
	};

	return (
		<>
			<button
				type="button"
				aria-haspopup
				aria-expanded={ showPopover }
				aria-label={ __( 'More information' ) }
				onMouseEnter={ handleOnMouseEnterButton }
				onMouseLeave={ handleOnMouseLeave }
				ref={ iconRef }
				className={ classNames( 'status-popover', className ) }
			>
				<Gridicon icon="info-outline" size={ 18 } />
			</button>
			{ showPopover && (
				<Popover
					autoRtl
					id="status-popover"
					isVisible
					context={ iconRef.current }
					position="top"
					className={ classNames( 'status-popover__tooltip', className ) }
					onMouseEnter={ handleOnMouseEnterPopover }
					onMouseLeave={ handleOnMouseLeavePopover }
				>
					{ children }
				</Popover>
			) }
		</>
	);
};
