/**
 * External dependencies
 */
import * as React from 'react';
import { Popover } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { select } from '@wordpress/data';
import DomainPicker, { Props as DomainPickerProps } from '@automattic/domain-picker';

/**
 * Internal dependencies
 */
import { recordEnterModal, recordCloseModal } from '../../lib/analytics';
import { STORE_KEY } from '../../stores/onboard';

/**
 * Style dependencies
 */
import './style.scss';

interface Props extends DomainPickerProps {
	isOpen: boolean;
}

const DomainPickerPopover: React.FunctionComponent< Props > = ( { isOpen, onClose, ...props } ) => {
	// Popover expands at medium viewport width
	const isMobile = useViewportMatch( 'medium', '<' );

	const tracksName = 'DomainPickerPopover';

	React.useEffect( () => {
		if ( isOpen ) {
			recordEnterModal( tracksName );
		}
	}, [ isOpen ] );

	const handleClose = () => {
		recordCloseModal( tracksName, {
			selected_domain: select( STORE_KEY ).getSelectedDomain()?.domain_name,
		} );
		onClose?.();
	};

	// Don't render popover when isOpen is false.
	// We need this component to be hot because useViewportMatch
	// returns false on initial mount before returning true,
	// causing search input to be automatically focused.
	if ( ! isOpen ) {
		return null;
	}

	return (
		<div className="domain-picker-popover">
			<Popover
				focusOnMount={ isMobile ? 'container' : 'firstElement' }
				noArrow
				onClose={ handleClose }
				onFocusOutside={ handleClose }
				position={ 'bottom center' }
				expandOnMobile={ true }
			>
				<DomainPicker onClose={ handleClose } { ...props } />
			</Popover>
		</div>
	);
};

export default DomainPickerPopover;
