/**
 * External dependencies
 */
import * as React from 'react';
import { Button, Popover } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';
import config from 'config';

// Core package needs to add this to the type definitions.
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { useViewportMatch } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import DomainPicker, { Props as DomainPickerProps } from '../domain-picker';
import CloseButton from '../close-button';

/**
 * Style dependencies
 */
import './style.scss';

interface Props extends DomainPickerProps {
	isOpen: boolean;
	onMoreOptions?: () => void;
}

const DomainPickerPopover: React.FunctionComponent< Props > = ( {
	isOpen,
	onMoreOptions,
	...props
} ) => {
	const { __ } = useI18n();
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
				<div className="domain-picker-popover__addons">
					{ config.isEnabled( 'gutenboarding/domain-picker-modal' ) && (
						<Button
							className="domain-picker-popover__more-button"
							isTertiary
							onClick={ onMoreOptions }
						>
							{ __( 'More Options' ) }
						</Button>
					) }
					<CloseButton className="domain-picker-popover__close-button" onClick={ onClose } />
				</div>
			</Popover>
		</div>
	);
};

export default DomainPickerPopover;
