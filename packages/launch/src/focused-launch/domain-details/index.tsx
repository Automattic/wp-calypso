/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { __ } from '@wordpress/i18n';
import DomainPicker, { ITEM_TYPE_BUTTON } from '@automattic/domain-picker';
import { Title, SubTitle } from '@automattic/onboarding';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { useSite, useDomainSearch, useDomainSelection } from '../../hooks';
import { FOCUSED_LAUNCH_FLOW_ID } from '../../constants';
import GoBackButton from '../go-back-button';

import './style.scss';

const ANALYTICS_UI_LOCATION = 'domain_step';

const DomainDetails: React.FunctionComponent = () => {
	const { currentDomainName } = useSite();
	const { domainSearch, setDomainSearch } = useDomainSearch();
	const { onDomainSelect, onExistingSubdomainSelect, selectedDomain } = useDomainSelection();
	const history = useHistory();

	const goBack = () => {
		history.goBack();
	};

	const handleSelect = ( suggestion: DomainSuggestions.DomainSuggestion ) => {
		onDomainSelect( suggestion );
		goBack();
	};

	const trackDomainSearchInteraction = ( query: string ) => {
		recordTracksEvent( 'calypso_newsite_domain_search_blur', {
			flow: FOCUSED_LAUNCH_FLOW_ID,
			query,
			where: ANALYTICS_UI_LOCATION,
		} );
	};

	return (
		<div className="focused-launch-container">
			<div className="focused-launch-details__back-button-wrapper">
				<GoBackButton onClick={ goBack } />
			</div>
			<div className="focused-launch-details__header">
				<Title>{ __( 'Choose a domain', __i18n_text_domain__ ) }</Title>
				<SubTitle>
					{ __( 'Free for the first year with any paid plan.', __i18n_text_domain__ ) }
				</SubTitle>
			</div>
			<div className="focused-launch-details__body">
				<DomainPicker
					initialDomainSearch={ domainSearch }
					onSetDomainSearch={ setDomainSearch }
					onDomainSearchBlur={ trackDomainSearchInteraction }
					currentDomain={ selectedDomain?.domain_name || currentDomainName }
					existingSubdomain={ currentDomainName }
					onDomainSelect={ handleSelect }
					onExistingSubdomainSelect={ onExistingSubdomainSelect }
					analyticsFlowId={ FOCUSED_LAUNCH_FLOW_ID }
					analyticsUiAlgo={ ANALYTICS_UI_LOCATION }
					segregateFreeAndPaid
					locale={ document.documentElement.lang }
					itemType={ ITEM_TYPE_BUTTON }
				/>
			</div>
		</div>
	);
};

export default DomainDetails;
