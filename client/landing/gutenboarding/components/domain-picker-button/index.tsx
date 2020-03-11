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

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

interface Props extends DomainPickerProps, Button.BaseProps {
	className?: string;
	currentDomain?: DomainSuggestion;
}

const DomainPickerButton: FunctionComponent< Props > = ( {
	children,
	className,
	onDomainSelect,
	onDomainPurchase,
	defaultQuery,
	queryParameters,
	currentDomain,
	...buttonProps
} ) => {
	const buttonRef = createRef< HTMLButtonElement >();

	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState( false );
	const [
		userSelectedDomainSuggestion,
		setUserSelectedDomainSuggestion,
	] = useState< DomainSuggestion | null >( null );

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

	const handlePaidDomainSelect = ( selectedDomain: DomainSuggestion ) => {
		setDomainPopoverVisibility( false );
		setUserSelectedDomainSuggestion( selectedDomain );
	};

	const handlePurchaseCancel = () => {
		setUserSelectedDomainSuggestion( null );
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
			{ userSelectedDomainSuggestion && (
				<ConfirmPurchaseModal
					onCancel={ handlePurchaseCancel }
					onAccept={ () => {
						onDomainSelect( userSelectedDomainSuggestion );
						onDomainPurchase( userSelectedDomainSuggestion );
						setUserSelectedDomainSuggestion( null );
					} }
					selectedDomain={ userSelectedDomainSuggestion }
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
