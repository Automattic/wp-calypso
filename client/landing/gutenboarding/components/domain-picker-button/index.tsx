/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';
import { USER_STORE } from '../../stores/user';

import { useI18n } from '@automattic/react-i18n';
import classnames from 'classnames';
import type { DomainSuggestions } from '@automattic/data-stores';
import DomainPicker from '@automattic/domain-picker';

/**
 * Internal dependencies
 */
import DomainPickerPopover from '../domain-picker-popover';
import DomainPickerModal from '../domain-picker-modal';
import { FLOW_ID } from '../../constants';
import { STORE_KEY } from '../../stores/onboard';
import { useCurrentStep } from '../../path';
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
	const buttonRef = React.createRef< HTMLButtonElement >();

	const [ domainSearch, setDomainSearch ] = React.useState< string >( '' );

	const [ domainPickerMode, setDomainPickerMode ] = React.useState<
		'popover' | 'modal' | undefined
	>();

	const handlePopoverToggle = () => {
		setDomainPickerMode( ( mode ) => ( mode ? undefined : 'popover' ) );
	};

	const handleClose = () => {
		setDomainPickerMode( undefined );
	};

	const handleMoreOptions = () => {
		setDomainPickerMode( 'modal' );
	};

	const { __ } = useI18n();

	const currentStep = useCurrentStep();

	const { siteTitle, siteVertical } = useSelect( ( select ) => select( STORE_KEY ).getState() );
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );

	const prioritisedSearch = domainSearch.trim() || siteTitle;
	let searchVal;

	if ( currentStep !== 'IntentGathering' ) {
		searchVal =
			prioritisedSearch ||
			siteVertical?.label.trim() ||
			currentUser?.username ||
			__( 'My new site' );
	} else {
		searchVal = prioritisedSearch || '';
	}

	const domainPicker = (
		<DomainPicker
			analyticsFlowId={ FLOW_ID }
			domainSearch={ searchVal }
			onSetDomainSearch={ setDomainSearch }
			onMoreOptions={ handleMoreOptions }
			showDomainConnectButton={ domainPickerMode === 'modal' }
			onClose={ handleClose }
			showDomainCategories={ domainPickerMode === 'modal' }
			currentDomain={ currentDomain }
			onDomainSelect={ onDomainSelect }
			domainSuggestionVendor={ DOMAIN_SUGGESTION_VENDOR }
			analyticsUiAlgo={ domainPickerMode === 'modal' ? 'popover_popover' : 'domain_popover' }
		></DomainPicker>
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
