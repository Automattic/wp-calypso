/**
 * External dependencies
 */
import React, { ComponentPropsWithoutRef, createRef, FunctionComponent, useState } from 'react';
import { Button, Popover, Dashicon } from '@wordpress/components';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import DomainPicker from './list';

/**
 * Style dependencies
 */
import './style.scss';

type Props = ComponentPropsWithoutRef< typeof DomainPicker >;

const DomainPickerButton: FunctionComponent< Props > = ( {
	children,
	onDomainSelect,
	...domainPickerProps
} ) => {
	const buttonRef = createRef();

	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState( false );

	const handleClose = ( e?: FocusEvent ) => {
		// Don't collide with button toggling
		if ( e?.relatedTarget === buttonRef.current ) {
			return;
		}
		setDomainPopoverVisibility( false );
	};

	const handleDomainSelect: typeof onDomainSelect = selectedDomain => {
		setDomainPopoverVisibility( false );
		onDomainSelect( selectedDomain );
	};

	return (
		<>
			<Button
				aria-expanded={ isDomainPopoverVisible }
				aria-haspopup="menu"
				aria-pressed={ isDomainPopoverVisible }
				className={ classnames( 'domain-picker__button', { 'is-open': isDomainPopoverVisible } ) }
				onClick={ () => setDomainPopoverVisibility( s => ! s ) }
				ref={ buttonRef }
			>
				{ children }
				<Dashicon icon="arrow-down-alt2" />
			</Button>
			{ isDomainPopoverVisible && (
				<Popover onClose={ handleClose } onFocusOutside={ handleClose }>
					<DomainPicker { ...domainPickerProps } onDomainSelect={ handleDomainSelect } />
				</Popover>
			) }
		</>
	);
};

export default DomainPickerButton;
