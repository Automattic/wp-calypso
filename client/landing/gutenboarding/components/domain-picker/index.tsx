/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { Button, Panel, PanelBody, PanelRow, TextControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { times } from 'lodash';
import { useI18n } from '@automattic/react-i18n';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';

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

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

export interface Props {
	/**
	 * Callback that will be invoked when a domain is selected.
	 *
	 * @param domainSuggestion The selected domain.
	 */
	onDomainSelect: ( domainSuggestion: DomainSuggestion ) => void;

	/**
	 * Callback that will be invoked when a paid domain is selected.
	 *
	 * @param domainSuggestion The selected domain.
	 */
	onDomainPurchase: ( domainSuggestion: DomainSuggestion ) => void;

	/**
	 * Callback that will be invoked when a close button is clicked
	 */
	onClose: () => void;

	/**
	 * Additional parameters for the domain suggestions query.
	 */
	queryParameters?: Partial< DomainSuggestions.DomainSuggestionQuery >;

	currentDomain?: DomainSuggestion;
}

const DomainPicker: FunctionComponent< Props > = ( {
	onDomainSelect,
	onDomainPurchase,
	onClose,
	currentDomain,
} ) => {
	const { __: NO__ } = useI18n();
	const label = NO__( 'Search for a domain' );

	const { domainSearch } = useSelect( select => select( STORE_KEY ).getState() );
	const { setDomainSearch } = useDispatch( STORE_KEY );

	const allSuggestions = useDomainSuggestions();
	const freeSuggestions = getFreeDomainSuggestions( allSuggestions );
	const paidSuggestions = getPaidDomainSuggestions( allSuggestions )?.slice( 0, 5 );
	const recommendedSuggestion = getRecommendedDomainSuggestion( paidSuggestions );

	return (
		<Panel className="domain-picker">
			<PanelBody>
				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__header">
						<div className="domain-picker__header-title">{ NO__( 'Choose a new domain' ) }</div>
						<Button className="domain-picker__close-button" isTertiary onClick={ () => onClose() }>
							{ NO__( 'Skip for now' ) }
						</Button>
					</div>
					<div className="domain-picker__search">
						<TextControl
							hideLabelFromVision
							label={ label }
							placeholder={ label }
							onChange={ setDomainSearch }
							value={ domainSearch }
						/>
					</div>
				</PanelRow>

				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__suggestion-header">
						<div className="domain-picker__suggestion-header-title">
							{ NO__( 'Professional domain' ) }
						</div>
						<div className="domain-picker__suggestion-header-description">
							{ __experimentalCreateInterpolateElement(
								NO__( '<Price>Free</Price> for the first year with a paid plan' ),
								{ Price: <em /> }
							) }
						</div>
					</div>
					<div className="domain-picker__suggestion-item-group">
						{ ! paidSuggestions &&
							times( PAID_DOMAINS_TO_SHOW, i => <SuggestionItemPlaceholder key={ i } /> ) }
						{ paidSuggestions &&
							( paidSuggestions?.length ? (
								paidSuggestions.map( suggestion => (
									<SuggestionItem
										suggestion={ suggestion }
										isRecommended={ suggestion === recommendedSuggestion }
										isCurrent={ currentDomain?.domain_name === suggestion.domain_name }
										onClick={ () => onDomainPurchase( suggestion ) }
										key={ suggestion.domain_name }
									/>
								) )
							) : (
								<SuggestionNone />
							) ) }
					</div>
				</PanelRow>

				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__suggestion-header">
						<div className="domain-picker__suggestion-header-title">{ NO__( 'Subdomain' ) }</div>
					</div>
					<div className="domain-picker__suggestion-item-group">
						{ ! freeSuggestions && <SuggestionItemPlaceholder /> }
						{ freeSuggestions &&
							( freeSuggestions.length ? (
								<SuggestionItem
									suggestion={ freeSuggestions[ 0 ] }
									isCurrent={ currentDomain?.domain_name === freeSuggestions[ 0 ].domain_name }
									onClick={ () => onDomainSelect( freeSuggestions[ 0 ] ) }
								/>
							) : (
								<SuggestionNone />
							) ) }
					</div>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
};

export default DomainPicker;
