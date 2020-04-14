/**
 * External dependencies
 */
import React, { createRef, FunctionComponent, useState } from 'react';
import { Button, Popover, Dashicon } from '@wordpress/components';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import DomainPicker, { Props as DomainPickerProps } from '../domain-picker';

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

interface Props extends Omit< DomainPickerProps, 'onClose' >, Button.BaseProps {
	className?: string;
	currentDomain?: DomainSuggestion;
}

const DomainPickerButton: FunctionComponent< Props > = ( {
	children,
	className,
	onDomainSelect,
	currentDomain,
	...buttonProps
} ) => {
	const buttonRef = createRef< HTMLButtonElement >();

	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState( false );

	const handleClose = ( e?: React.FocusEvent ) => {
		// Don't collide with button toggling
		if ( e?.relatedTarget === buttonRef.current ) {
			return;
		}
		setDomainPopoverVisibility( false );
	};

	return (
		<>
			<Button
				{ ...buttonProps }
				aria-expanded={ isDomainPopoverVisible }
				aria-haspopup="menu"
				aria-pressed={ isDomainPopoverVisible }
				className={ classnames( 'domain-picker-button', className, {
					'is-open': isDomainPopoverVisible,
				} ) }
				onClick={ () => setDomainPopoverVisibility( s => ! s ) }
				ref={ buttonRef }
			>
				<span>{ children }</span>
				<Dashicon icon="arrow-down-alt2" size={ 16 } />
			</Button>
			{ isDomainPopoverVisible && (
				<div className="domain-picker-button__popover-container">
					<Popover
						className="domain-picker-button__popover"
						noArrow
						onClose={ handleClose }
						onFocusOutside={ handleClose }
						position={ 'bottom center' }
						expandOnMobile={ true }
					>
						<DomainPicker
							currentDomain={ currentDomain }
							onClose={ handleClose }
							onDomainSelect={ onDomainSelect }
						/>
					</Popover>
				</div>
			) }
		</>
	);
};

export default DomainPickerButton;
