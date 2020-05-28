/**
 * External dependencies
 */
import React, { createRef, FunctionComponent, useState, useEffect } from 'react';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

import classnames from 'classnames';

/**
 * Internal dependencies
 */
import DomainPickerPopover from '../domain-picker-popover';
import DomainPickerModal from '../domain-picker-modal';
import { FLOW_ID } from '../../constants';
import {
	recordTrainTracksEvent,
	getNewRailcarId,
	RecordTrainTracksEventProps,
} from '../../lib/analytics';
import { STORE_KEY } from '../../stores/onboard';
import { useDomainSuggestions } from '../../hooks/use-domain-suggestions';
import { DOMAIN_SUGGESTIONS_STORE } from '../../stores/domain-suggestions';
import { getSuggestionsVendor } from 'lib/domains/suggestions';

const DOMAIN_SUGGESTION_VENDOR = getSuggestionsVendor( true );

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

interface Props extends Button.BaseProps {
	className?: string;
	currentDomain?: DomainSuggestion;
	onDomainSelect: ( domainSuggestion: DomainSuggestion ) => void;
}

const DomainPickerButton: FunctionComponent< Props > = ( {
	children,
	className,
	onDomainSelect,
	currentDomain,
	...buttonProps
} ) => {
	const buttonRef = createRef< HTMLButtonElement >();

	const domainSuggestions = useDomainSuggestions( { locale: useI18n().i18nLocale, quantity: 10 } );

	const domainCategories = useSelect( ( select ) =>
		select( DOMAIN_SUGGESTIONS_STORE ).getCategories()
	);

	const [ railcarId, setRailcarId ] = useState< string | undefined >();

	useEffect( () => {
		// Only generate a railcarId when the domain suggestions change and are not empty.
		if ( domainSuggestions ) {
			setRailcarId( getNewRailcarId() );
		}
	}, [ domainSuggestions, setRailcarId ] );

	const { domainSearch, domainCategory } = useSelect( ( select ) =>
		select( STORE_KEY ).getState()
	);
	const { setDomainSearch, setDomainCategory } = useDispatch( STORE_KEY );

	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState( false );
	const [ isDomainModalVisible, setDomainModalVisibility ] = useState( false );

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

	const recordAnalytics = ( event: RecordTrainTracksEventProps ) => {
		recordTrainTracksEvent( `/${ FLOW_ID }/domain-popover`, event );
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
				recordAnalytics={ recordAnalytics }
				railcarId={ railcarId }
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
				recordAnalytics={ recordAnalytics }
				railcarId={ railcarId }
				domainSuggestionVendor={ DOMAIN_SUGGESTION_VENDOR }
			/>
		</>
	);
};

export default DomainPickerButton;
