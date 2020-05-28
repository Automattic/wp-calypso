/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import classnames from 'classnames';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import DomainPickerPopover from '../domain-picker-popover';
import DomainPickerModal from '../domain-picker-modal';
import { FLOW_ID } from '../../constants';
import { STORE_KEY } from '../../stores/onboard';
import { useDomainSuggestions } from '../../hooks/use-domain-suggestions';
import { DOMAIN_SUGGESTIONS_STORE } from '../../stores/domain-suggestions';
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

	const domainSuggestions = useDomainSuggestions( { locale: useI18n().i18nLocale, quantity: 10 } );

	const domainCategories = useSelect( ( select ) =>
		select( DOMAIN_SUGGESTIONS_STORE ).getCategories()
	);

	const { domainSearch, domainCategory } = useSelect( ( select ) =>
		select( STORE_KEY ).getState()
	);
	const { setDomainSearch, setDomainCategory } = useDispatch( STORE_KEY );

	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = React.useState( false );
	const [ isDomainModalVisible, setDomainModalVisibility ] = React.useState( false );

	const handlePopoverClose = ( e?: React.FocusEvent ) => {
		// Don't collide with button toggling
		if ( e?.relatedTarget === buttonRef.current ) {
			return;
		}
		setDomainPopoverVisibility( false );
	};

	const handleModalClose = () => {
		setDomainModalVisibility( false );
	};

	const handleMoreOptions = () => {
		setDomainPopoverVisibility( false );
		setDomainModalVisibility( true );
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
					'is-modal-open': isDomainModalVisible,
				} ) }
				onClick={ () => setDomainPopoverVisibility( ( s ) => ! s ) }
				ref={ buttonRef }
			>
				<span className="domain-picker-button__label">{ children }</span>
				<Icon icon={ chevronDown } size={ 22 } />
			</Button>
			<DomainPickerPopover
				analyticsFlowId={ FLOW_ID }
				domainSuggestions={ domainSuggestions }
				domainCategory={ domainCategory }
				domainCategories={ domainCategories }
				onSetDomainCategory={ setDomainCategory }
				domainSearch={ domainSearch }
				onSetDomainSearch={ setDomainSearch }
				isOpen={ isDomainPopoverVisible }
				showDomainConnectButton={ false }
				showDomainCategories={ false }
				currentDomain={ currentDomain }
				onDomainSelect={ onDomainSelect }
				onMoreOptions={ handleMoreOptions }
				onClose={ handlePopoverClose }
				domainSuggestionVendor={ DOMAIN_SUGGESTION_VENDOR }
			/>
			<DomainPickerModal
				analyticsFlowId={ FLOW_ID }
				domainSuggestions={ domainSuggestions }
				domainCategory={ domainCategory }
				domainCategories={ domainCategories }
				onSetDomainCategory={ setDomainCategory }
				domainSearch={ domainSearch }
				onSetDomainSearch={ setDomainSearch }
				isOpen={ isDomainModalVisible }
				showDomainConnectButton
				showDomainCategories
				currentDomain={ currentDomain }
				onDomainSelect={ onDomainSelect }
				onClose={ handleModalClose }
				domainSuggestionVendor={ DOMAIN_SUGGESTION_VENDOR }
			/>
		</>
	);
};

export default DomainPickerButton;
