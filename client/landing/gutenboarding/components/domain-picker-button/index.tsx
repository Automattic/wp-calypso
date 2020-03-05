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
import ConfirmPurchaseModal from '../confirm-purchase-modal';

/**
 * Style dependencies
 */
import './style.scss';

interface Props extends DomainPickerProps, Button.BaseProps {
	className?: string;
}

const DomainPickerButton: FunctionComponent< Props > = ( {
	children,
	className,
	onDomainSelect,
	onDomainPurchase,
	defaultQuery,
	queryParameters,
	currentUser,
	currentDomain,
	...buttonProps
} ) => {
	const buttonRef = createRef< HTMLButtonElement >();

	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState( false );
	const [ isPurchaseDomainVisible, setPurchaseDomainVisibility ] = useState( false );
	const [ userSelectedDomain, setUserSelectedDomain ] = useState( '' );

	const handleClose = ( e?: React.FocusEvent ) => {
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

	const handlePaidDomainSelect: typeof onDomainPurchase = selectedDomain => {
		setDomainPopoverVisibility( false );
		setPurchaseDomainVisibility( true );
		setUserSelectedDomain( selectedDomain );
	};

	const handlePurchaseCancel = () => {
		setPurchaseDomainVisibility( false );
		setUserSelectedDomain( '' );
	};

	const handleDomainPurchase = () => {
		onDomainSelect( userSelectedDomain );
		onDomainPurchase( userSelectedDomain );
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
				<Dashicon icon="arrow-down-alt2" />
			</Button>
			{ isPurchaseDomainVisible && (
				<ConfirmPurchaseModal
					onCancel={ handlePurchaseCancel }
					onAccept={ handleDomainPurchase }
					selectedDomain={ userSelectedDomain }
					isLogged={ !! currentUser }
				/>
			) }
			{ isDomainPopoverVisible && (
				<Popover onClose={ handleClose } onFocusOutside={ handleClose }>
					<DomainPicker
						defaultQuery={ defaultQuery }
						onDomainSelect={ handleDomainSelect }
						onDomainPurchase={ handlePaidDomainSelect }
						queryParameters={ queryParameters }
						currentDomain={ currentDomain }
					/>
				</Popover>
			) }
		</>
	);
};

export default DomainPickerButton;
