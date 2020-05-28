/**
 * External dependencies
 */
import React, { FunctionComponent, useState, useEffect } from 'react';
import { Button, Panel, PanelBody, PanelRow, TextControl } from '@wordpress/components';
import { Icon, search } from '@wordpress/icons';

import { getNewRailcarId } from '@automattic/calypso-analytics';
import { times } from 'lodash';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import SuggestionItem from './suggestion-item';
import SuggestionNone from './suggestion-none';
import SuggestionItemPlaceholder from './suggestion-item-placeholder';
import {
	getFreeDomainSuggestions,
	getPaidDomainSuggestions,
	getRecommendedDomainSuggestion,
} from '../utils/domain-suggestions';
import DomainCategories from '../domain-categories';
import CloseButton from '../close-button';

const PAID_DOMAINS_TO_SHOW = 5;

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;
type DomainSuggestionQuery = import('@automattic/data-stores').DomainSuggestions.DomainSuggestionQuery;
type DomainCategory = import('@automattic/data-stores').DomainSuggestions.DomainCategory;

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

	/**
	 * Additional parameters for the domain suggestions query.
	 */
	queryParameters?: Partial< DomainSuggestionQuery >;

	currentDomain?: DomainSuggestion;

	quantity?: number;

	/** The domain search query */
	domainSearch: string;
	/** Called when the domain search query is changed */
	onSetDomainSearch: ( query: string ) => void;

	/** The domain category */
	domainCategory: string | undefined;

	/** Called when the domain category is set */
	onSetDomainCategory: ( category?: string ) => void;

	/** The search results */
	domainSuggestions?: DomainSuggestion[];

	/** The flow where the Domain Picker is used. Eg Gutenboarding */
	analyticsFlowId: string;

	domainCategories: DomainCategory[];

	domainSuggestionVendor: string;
}

const DomainPicker: FunctionComponent< Props > = ( {
	showDomainConnectButton,
	showDomainCategories,
	onDomainSelect,
	onClose,
	onMoreOptions,
	quantity = PAID_DOMAINS_TO_SHOW,
	currentDomain,
	domainSearch,
	onSetDomainSearch,
	domainCategory,
	onSetDomainCategory,
	domainSuggestions,
	analyticsFlowId,
	domainCategories,
	domainSuggestionVendor,
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
			<Button isLink className="domain-picker__cancel-button" onClick={ onClose } { ...props }>
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

	/** The train track ID for analytics. See https://wp.me/PCYsg-bor */
	const [ railcarId, setRailcarId ] = useState< string | undefined >();
	useEffect( () => {
		// Only generate a railcarId when the domain suggestions change and are not empty.
		if ( domainSuggestions ) {
			setRailcarId( getNewRailcarId( 'suggestion' ) );
		}
	}, [ domainSuggestions, setRailcarId ] );

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
										categorySlug={ domainCategory }
										onSelect={ setCurrentSelection }
										railcarId={ railcarId ? `${ railcarId }0` : undefined }
										uiPosition={ 0 }
										domainSuggestionVendor={ domainSuggestionVendor }
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
											categorySlug={ domainCategory }
											onSelect={ setCurrentSelection }
											key={ suggestion.domain_name }
											railcarId={ railcarId ? `${ railcarId }${ i + 1 }` : undefined }
											uiPosition={ i + 1 }
											domainSearch={ domainSearch }
											analyticsFlowId={ analyticsFlowId }
											domainSuggestionVendor={ domainSuggestionVendor }
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
