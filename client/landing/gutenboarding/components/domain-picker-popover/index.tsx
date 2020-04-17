/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
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

// TODO: Extend popover props?
interface Props extends DomainPickerProps {
	onMoreOptions?: () => void;
}

const DomainPickerPopover: FunctionComponent< Props > = ( {
	showDomainConnectButton,
	showDomainCategories,
	onDomainSelect,
	onMoreOptions,
	onClose,
	currentDomain,
} ) => {
	const { __ } = useI18n();

	// Popover expands at medium viewport width
	const isMobile = useViewportMatch( 'medium', '<' );

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
				<DomainPicker
					showDomainConnectButton={ showDomainConnectButton }
					showDomainCategories={ showDomainCategories }
					currentDomain={ currentDomain }
					onDomainSelect={ onDomainSelect }
					onClose={ onClose }
				/>
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
			</Popover>
		</div>
	);
};

export default DomainPickerPopover;
