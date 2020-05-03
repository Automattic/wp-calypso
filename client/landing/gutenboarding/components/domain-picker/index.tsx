/**
 * External dependencies
 */
import React, { FunctionComponent, useState, useEffect } from 'react';
import { Button, Panel, PanelBody, PanelRow, TextControl, Icon } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { times } from 'lodash';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { DomainSuggestions } from '@automattic/data-stores';
import { STORE_KEY } from '../../stores/onboard';
import SuggestionItem from './suggestion-item';
import SuggestionNone from './suggestion-none';
import SuggestionItemPlaceholder from './suggestion-item-placeholder';
import {
	getFreeDomainSuggestions,
	getPaidDomainSuggestions,
	getRecommendedDomainSuggestion,
} from '../../utils/domain-suggestions';
import { useDomainSuggestions } from '../../hooks/use-domain-suggestions';
import { PAID_DOMAINS_TO_SHOW } from '../../constants';
import { getNewRailcarId, RecordTrainTracksEventProps } from '../../lib/analytics';
import { useTrackModal } from '../../hooks/use-track-modal';
import DomainCategories from '../domain-categories';
import CloseButton from '../close-button';

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

export interface Props {
	showDomainConnectButton?: boolean;

	showDomainCategories?: boolean;

	/**
	 * Callback that will be invoked when a domain is selected.
	 *
	 * @param domainSuggestion The selected domain.
	 */
	onDomainSelect: ( domainSuggestion: DomainSuggestion ) => void;

	/**
	 * Callback that will be invoked when close button is clicked
	 */
	onClose: () => void;

	onMoreOptions?: () => void;

	recordAnalytics?: ( event: RecordTrainTracksEventProps ) => void;

	/**
	 * Additional parameters for the domain suggestions query.
	 */
	queryParameters?: Partial< DomainSuggestions.DomainSuggestionQuery >;

	currentDomain?: DomainSuggestion;

	quantity?: number;
}

const DomainPicker: FunctionComponent< Props > = ( {
	showDomainConnectButton,
	showDomainCategories,
	onDomainSelect,
	onClose,
	onMoreOptions,
	quantity = PAID_DOMAINS_TO_SHOW,
	currentDomain,
	recordAnalytics,
} ) => {
	const { __, i18nLocale } = useI18n();
	const label = __( 'Search for a domain' );
	const { getSelectedDomain } = useSelect( ( select ) => select( STORE_KEY ) );

	const { domainSearch, domainCategory } = useSelect( ( select ) =>
		select( STORE_KEY ).getState()
	);
	const { setDomainSearch, setDomainCategory } = useDispatch( STORE_KEY );
	const [ currentSelection, setCurrentSelection ] = useState( currentDomain );

	const allSuggestions = useDomainSuggestions( { locale: i18nLocale, quantity } );
	const freeSuggestions = getFreeDomainSuggestions( allSuggestions );
	const paidSuggestions = getPaidDomainSuggestions( allSuggestions )?.slice( 0, quantity );
	const recommendedSuggestion = getRecommendedDomainSuggestion( paidSuggestions );
	const hasSuggestions = freeSuggestions?.length || paidSuggestions?.length;

	const ConfirmButton: FunctionComponent< Button.ButtonProps > = ( { ...props } ) => {
		return (
			<Button
				className="domain-picker__confirm-button"
				isPrimary
				disabled={ ! hasSuggestions }
				onClick={ () => {
					currentSelection && onDomainSelect( currentSelection );
					onClose();
				} }
				{ ...props }
			>
				{ __( 'Confirm' ) }
			</Button>
		);
	};

	const [ railcarId, setRailcarId ] = useState< string | undefined >();

	useEffect( () => {
		// Only generate a railcarId when the domain suggestions change and are not empty.
		if ( allSuggestions ) {
			setRailcarId( getNewRailcarId() );
		}
	}, [ allSuggestions ] );

	useEffect( () => {
		// Auto-select one of the domains when the search results change. If the currently
		// confirmed domain is in the search results then select it. The user probably
		// re-ran their previous query. Otherwise select the free domain suggestion.

		if (
			allSuggestions?.find(
				( suggestion ) => currentDomain?.domain_name === suggestion.domain_name
			)
		) {
			setCurrentSelection( currentDomain );
			return;
		}

		// Recalculate free-domain suggestions inside the closure. `getFreeDomainSuggestions()`
		// always returns a new object so it shouldn't be used in `useEffects()` dependencies list.
		const latestFreeSuggestion = getFreeDomainSuggestions( allSuggestions );

		if ( latestFreeSuggestion ) {
			setCurrentSelection( latestFreeSuggestion[ 0 ] );
		}
	}, [ allSuggestions, currentDomain ] );

	useTrackModal( 'DomainPicker', () => ( {
		selected_domain: getSelectedDomain()?.domain_name,
	} ) );

	return (
		<Panel className="domain-picker">
			<PanelBody>
				<PanelRow className="domain-picker__panel-row-main">
					<div className="domain-picker__header">
						<div className="domain-picker__header-group">
							<div className="domain-picker__header-title">{ __( 'Choose a domain' ) }</div>
							{ showDomainConnectButton ? (
								<p>{ __( 'Free for the first year with any paid plan.' ) }</p>
							) : (
								<p>{ __( 'Free for the first year with any paid plan.' ) }</p>
							) }
						</div>
						<ConfirmButton />
						<CloseButton
							className="domain-picker__close-button"
							onClick={ onClose }
							tabIndex={ -1 }
						/>
					</div>
					<div className="domain-picker__search">
						<SearchIcon />
						<TextControl
							hideLabelFromVision
							label={ label }
							placeholder={ label }
							onChange={ setDomainSearch }
							value={ domainSearch }
						/>
					</div>
					<div className="domain-picker__body">
						{ showDomainCategories && (
							<div className="domain-picker__aside">
								<DomainCategories selected={ domainCategory } onSelect={ setDomainCategory } />
							</div>
						) }
						<div className="domain-picker__suggestion-item-group">
							{ ! freeSuggestions && <SuggestionItemPlaceholder /> }
							{ freeSuggestions &&
								( freeSuggestions.length ? (
									<SuggestionItem
										suggestion={ freeSuggestions[ 0 ] }
										isSelected={
											currentSelection?.domain_name === freeSuggestions[ 0 ].domain_name
										}
										onSelect={ setCurrentSelection }
										railcarId={ railcarId ? `${ railcarId }0` : undefined }
										recordAnalytics={ recordAnalytics || undefined }
										uiPosition={ 0 }
									/>
								) : (
									<SuggestionNone />
								) ) }
							{ ! paidSuggestions &&
								times( quantity - 1, ( i ) => <SuggestionItemPlaceholder key={ i } /> ) }
							{ paidSuggestions &&
								( paidSuggestions?.length ? (
									paidSuggestions.map( ( suggestion, i ) => (
										<SuggestionItem
											suggestion={ suggestion }
											isRecommended={ suggestion === recommendedSuggestion }
											isSelected={ currentSelection?.domain_name === suggestion.domain_name }
											onSelect={ setCurrentSelection }
											key={ suggestion.domain_name }
											railcarId={ railcarId ? `${ railcarId }${ i + 1 }` : undefined }
											recordAnalytics={ recordAnalytics || undefined }
											uiPosition={ i + 1 }
										/>
									) )
								) : (
									<SuggestionNone />
								) ) }
						</div>
					</div>
				</PanelRow>
				<PanelRow className="domain-picker__panel-row-footer">
					<div className="domain-picker__footer">
						<Button className="domain-picker__more-button" isTertiary onClick={ onMoreOptions }>
							{ __( 'More Options' ) }
						</Button>
						<ConfirmButton />
					</div>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
};

const SearchIcon = () => (
	<Icon
		icon={ () => (
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M6 18L10 14.5" stroke="black" strokeWidth="1.5" />
				<circle cx="13.5" cy="11.5" r="4.75" stroke="black" strokeWidth="1.5" />
			</svg>
		) }
	/>
);

export default DomainPicker;
