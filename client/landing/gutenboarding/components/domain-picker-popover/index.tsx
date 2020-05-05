/**
 * External dependencies
 */
import * as React from 'react';
import { Popover } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import DomainPicker, { Props as DomainPickerProps } from '../domain-picker';

/**
 * Style dependencies
 */
import './style.scss';

interface Props extends DomainPickerProps {
	isOpen: boolean;
}

const DomainPickerPopover: React.FunctionComponent< Props > = ( { isOpen, ...props } ) => {
	const onClose = props.onClose;

	// Popover expands at medium viewport width
	const isMobile = useViewportMatch( 'medium', '<' );

	// Don't render popover when isOpen is false.
	// We need this component to be hot because useViewportMatch
	// returns false on initial mount before returning true,
	// causing search input to be automatically focused.
	if ( ! isOpen ) return null;

	return (
		<div className="domain-picker-popover">
			<Popover
				focusOnMount={ isMobile ? 'container' : 'firstElement' }
				noArrow
				onClose={ onClose }
				onFocusOutside={ onClose }
				position={ 'bottom center' }
				expandOnMobile={ true }
			>
				<DomainPicker { ...props } />
			</Popover>
		</div>
	);
};

export default DomainPickerPopover;
