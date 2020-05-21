/**
 * External dependencies
 */
import React, { FunctionComponent, useState, useEffect } from 'react';
import { Button, Panel, PanelBody, PanelRow, TextControl } from '@wordpress/components';
import { Icon, search } from '@wordpress/icons';
import { times } from 'lodash';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { DomainSuggestions } from '@automattic/data-stores';
import SuggestionItem from './suggestion-item';
import SuggestionNone from './suggestion-none';
import SuggestionItemPlaceholder from './suggestion-item-placeholder';
import {
	getFreeDomainSuggestions,
	getPaidDomainSuggestions,
	getRecommendedDomainSuggestion,
} from '../utils/domain-suggestions';
import { useTrackModal } from '../hooks/use-track-modal';
import DomainCategories from '../domain-categories';
import CloseButton from '../close-button';

const PAID_DOMAINS_TO_SHOW = 5;

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;
type DomainCategory = DomainSuggestions.DomainCategory;

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

	onCancel?: () => void;

	onMoreOptions?: () => void;

	// TODO: How to use analytics type here?
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	recordAnalytics?: ( event ) => void;

	/**
	 * Additional parameters for the domain suggestions query.
	 */
	queryParameters?: Partial< DomainSuggestions.DomainSuggestionQuery >;

	currentDomain?: DomainSuggestion;

	quantity?: number;

	/**
	 * Name used to identify this component in tracks events.
	 */
	tracksName: string;
	selectedDomain: DomainSuggestion | undefined;

	/** The domain search query */
	domainSearch: string;
	/** Called when the domain search query is changed */
	onSetDomainSearch: ( query: string ) => void;

	/** The domain category */
	domainCategory: string | undefined;

	/** Called when the domain category is set */
	onSetDomainCategory: ( category?: string ) => void;

	/** Called when the modal is opened. Can be used for analytics */
	onModalOpen: ( modalName: string ) => void;

	/** Called when the modal is closed or unmounted in any way. Can be used for analytics */
	// TODO: How to use analytics type here?
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	onModalUnmount: () => ( modalName: string, eventProps? ) => void;

	/** The search results */
	domainSuggestions?: DomainSuggestion[];

	/** The train track ID for analytics. See https://wp.me/PCYsg-bor */
	railcarId: string | undefined;

	/** The flow where the Domain Picker is used. Eg Gutenboarding */
	analyticsFlowId: string;

	domainCategories: DomainCategory[];
}

const DomainPicker: FunctionComponent< Props > = ( {
	showDomainConnectButton,
	showDomainCategories,
	onDomainSelect,
	onClose,
	onCancel,
	onMoreOptions,
	quantity = PAID_DOMAINS_TO_SHOW,
	currentDomain,
	recordAnalytics,
	tracksName,
	selectedDomain,
	domainSearch,
	onSetDomainSearch,
	domainCategory,
	onSetDomainCategory,
	onModalOpen,
	onModalUnmount,
	domainSuggestions,
	railcarId,
	analyticsFlowId,
	domainCategories,
} ) => {
	const { __ } = useI18n();
	const label = __( 'Search for a domain' );

	const [ currentSelection, setCurrentSelection ] = useState( currentDomain );

	const allSuggestions = domainSuggestions;
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

	const CancelButton: FunctionComponent< Button.ButtonProps > = ( { ...props } ) => {
		return (
			<Button
				isLink
				className="domain-picker__cancel-button"
				onClick={ () => {
					onCancel && onCancel();
				} }
				{ ...props }
			>
				{ __( 'Cancel' ) }
			</Button>
		);
	};

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

	useTrackModal( tracksName, onModalOpen, onModalUnmount, {
		selected_domain: selectedDomain?.domain_name,
	} );

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
						<div className="domain-picker__header-buttons">
							<CancelButton />
							<ConfirmButton />
							<CloseButton
								className="domain-picker__close-button"
								onClick={ onClose }
								tabIndex={ -1 }
							/>
						</div>
					</div>
					<div className="domain-picker__search">
						<div className="domain-picker__search-icon">
							<Icon icon={ search } />
						</div>
						<TextControl
							data-hj-whitelist
							hideLabelFromVision
							label={ label }
							placeholder={ label }
							onChange={ onSetDomainSearch }
							value={ domainSearch }
						/>
					</div>
					<div className="domain-picker__body">
						{ showDomainCategories && (
							<div className="domain-picker__aside">
								<DomainCategories
									domainCategories={ domainCategories }
									selected={ domainCategory }
									onSelect={ onSetDomainCategory }
								/>
							</div>
						) }
						<div className="domain-picker__suggestion-item-group">
							{ ! freeSuggestions && <SuggestionItemPlaceholder /> }
							{ freeSuggestions &&
								( freeSuggestions.length ? (
									<SuggestionItem
										analyticsFlowId={ analyticsFlowId }
										suggestion={ freeSuggestions[ 0 ] }
										isSelected={
											currentSelection?.domain_name === freeSuggestions[ 0 ].domain_name
										}
										domainSearch={ domainSearch }
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
											domainSearch={ domainSearch }
											analyticsFlowId={ analyticsFlowId }
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
						<CancelButton />
						<ConfirmButton />
					</div>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
};

export default DomainPicker;
