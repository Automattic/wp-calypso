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

interface Props {
	/**
	 * Term to search when no user input is provided.
	 */
	defaultQuery?: ComponentPropsWithoutRef< typeof DomainPicker >[ 'defaultQuery' ];

	/**
	 * Additional parameters for the domain suggestions query.
	 *
	 * @see DomainPicker for defaults
	 */
	queryParameters?: ComponentPropsWithoutRef< typeof DomainPicker >[ 'queryParameters' ];
}

const DomainPickerButton: FunctionComponent< Props > = ( { children, ...domainPickerProps } ) => {
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
					<DomainPicker { ...domainPickerProps } />
				</Popover>
			) }
		</>
	);
};

export default DomainPickerButton;
