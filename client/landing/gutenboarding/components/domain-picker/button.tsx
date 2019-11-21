/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { __ as NO__ } from '@wordpress/i18n';
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

const DomainPickerButton: FunctionComponent = ( { children } ) => {
	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState( false );

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
					<DomainPicker />
				</Popover>
			) }
		</>
	);
};

export default DomainPickerButton;
