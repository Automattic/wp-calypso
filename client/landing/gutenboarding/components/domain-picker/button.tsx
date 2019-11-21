/**
 * External dependencies
 */
import React, { ComponentPropsWithoutRef, FunctionComponent, useState } from 'react';
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
	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState( false );

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
			>
				{ children }
				<Dashicon icon="arrow-down-alt2" />
			</Button>
			{ isDomainPopoverVisible && (
				<Popover>
					<DomainPicker { ...domainPickerProps } onDomainSelect={ handleDomainSelect } />
				</Popover>
			) }
		</>
	);
};

export default DomainPickerButton;
