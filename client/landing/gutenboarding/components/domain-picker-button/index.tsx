/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import type { DomainSuggestions } from '@automattic/data-stores';
import DomainPicker from '@automattic/domain-picker';

/**
 * Internal dependencies
 */
import DomainPickerPopover from '../domain-picker-popover';
import DomainPickerModal from '../domain-picker-modal';
import { FLOW_ID } from '../../constants';
import { STORE_KEY } from '../../stores/onboard';
import { getSuggestionsVendor } from 'lib/domains/suggestions';

const DOMAIN_SUGGESTION_VENDOR = getSuggestionsVendor( true );

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

interface Props extends Button.BaseProps {
	className?: string;
	currentDomain?: DomainSuggestion;
	onDomainSelect: ( domainSuggestion: DomainSuggestion ) => void;
}

const DomainPickerButton: React.FunctionComponent< Props > = ( {
	children,
	className,
	onDomainSelect,
	currentDomain,
	...buttonProps
} ) => {
	const { __ } = useI18n();

	const buttonRef = React.createRef< HTMLButtonElement >();

	const [ domainPickerMode, setDomainPickerMode ] = React.useState<
		'popover' | 'modal' | undefined
	>();

	const handlePopoverToggle = () => {
		setDomainPickerMode( ( mode ) => ( mode ? undefined : 'popover' ) );
	};

	const handleClose = () => {
		setDomainPickerMode( undefined );
	};

	const onClickMoreOptions = () => {
		setDomainPickerMode( 'modal' );
	};

	const domainSearch = useSelect( ( select ) => select( STORE_KEY ).getDomainSearch() );
	const { setDomainSearch } = useDispatch( STORE_KEY );

	const domainPicker = (
		<DomainPicker
			analyticsFlowId={ FLOW_ID }
			domainSearch={ domainSearch || __( 'My new site' ) }
			onSetDomainSearch={ setDomainSearch }
			onMoreOptions={ onClickMoreOptions }
			showDomainConnectButton={ domainPickerMode === 'modal' }
			onClose={ handleClose }
			showDomainCategories={ domainPickerMode === 'modal' }
			currentDomain={ currentDomain }
			onDomainSelect={ onDomainSelect }
			domainSuggestionVendor={ DOMAIN_SUGGESTION_VENDOR }
			analyticsUiAlgo={ domainPickerMode === 'modal' ? 'domain_modal' : 'domain_popover' }
		/>
	);

	return (
		<>
			<Button
				{ ...buttonProps }
				aria-expanded={ !! domainPickerMode }
				aria-haspopup="menu"
				aria-pressed={ !! domainPickerMode }
				className={ classnames( 'domain-picker-button', className, {
					'is-open': !! domainPickerMode,
					'is-modal-open': domainPickerMode === 'modal',
				} ) }
				onClick={ handlePopoverToggle }
				ref={ buttonRef }
			>
				<span className="domain-picker-button__label">{ children }</span>
				<Icon icon={ chevronDown } size={ 22 } />
			</Button>
			<DomainPickerPopover
				isOpen={ domainPickerMode === 'popover' }
				onClose={ handlePopoverToggle }
			>
				{ domainPicker }
			</DomainPickerPopover>
			<DomainPickerModal isOpen={ domainPickerMode === 'modal' } onClose={ handleClose }>
				{ domainPicker }
			</DomainPickerModal>
		</>
	);
};

export default DomainPickerButton;
