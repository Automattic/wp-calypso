import { Gridicon, Popover } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import React, { useState, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import './style.scss';

type StatusPopoverProps = {
	children: React.ReactNode;
	className?: string;
	target?: React.ReactNode;
};

export const StatusPopover = ( {
	children,
	className,
	target = <Gridicon icon="info-outline" size={ 18 } />,
}: StatusPopoverProps ) => {
	const iconRef = useRef( null );
	const [ inPopover, setInPopover ] = useState( false );
	const [ inButton, setInButton ] = useState( false );
	const [ showPopover ] = useDebounce( inPopover || inButton, 250 );
	const { __ } = useI18n();

	const handleOnMouseEnterButton = () => {
		setInButton( true );
	};

	const handleOnMouseLeave = () => {
		setInButton( false );
	};

	const handleOnMouseEnterPopover = () => {
		setInPopover( true );
	};

	const handleOnMouseLeavePopover = () => {
		setInPopover( false );
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
				{ target }
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
