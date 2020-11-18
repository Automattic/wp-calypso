/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import DomainPicker, { ITEM_TYPE_BUTTON } from '@automattic/domain-picker';
import { Title, SubTitle, BackButton } from '@automattic/onboarding';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Icon, chevronLeft } from '@wordpress/icons';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { useSite, useDomainSearch, useDomainSelection } from '../../hooks';
import { LAUNCH_STORE } from '../../stores';
import { FOCUSED_LAUNCH_FLOW_ID } from '../../constants';

import './style.scss';

const ANALYTICS_UI_LOCATION = 'domain_step';
const NUMBER_OF_VISIBLE_DOMAINS = 10;

const DomainDetails: React.FunctionComponent = () => {
	const { currentDomainName } = useSite();
	const { domainSearch } = useDomainSearch();
	const { onDomainSelect, onExistingSubdomainSelect, selectedDomain } = useDomainSelection();
	const { setDomainSearch } = useDispatch( LAUNCH_STORE );
	const history = useHistory();

	const goBack = () => {
		history.goBack();
	};

	const handleDomainSelect = ( suggestion: DomainSuggestions.DomainSuggestion ) => {
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
			<div className="focused-launch-domain-details__header">
				<div className="focused-launch-domain-details__back-link">
					<BackButton onClick={ goBack }>
						<Icon icon={ chevronLeft } />
						<span>{ __( 'Go back', __i18n_text_domain__ ) }</span>
					</BackButton>
				</div>
				<Title>{ __( 'Choose a domain', __i18n_text_domain__ ) }</Title>
				<SubTitle>
					{ __( 'Free for the first year with any paid plan.', __i18n_text_domain__ ) }
				</SubTitle>
			</div>
			<div className="focused-launch-domain-details__body">
				<DomainPicker
					initialDomainSearch={ domainSearch }
					onSetDomainSearch={ setDomainSearch }
					onDomainSearchBlur={ trackDomainSearchInteraction }
					currentDomain={ selectedDomain?.domain_name || currentDomainName }
					existingSubdomain={ currentDomainName }
					onDomainSelect={ handleDomainSelect }
					onExistingSubdomainSelect={ onExistingSubdomainSelect }
					analyticsFlowId={ FOCUSED_LAUNCH_FLOW_ID }
					analyticsUiAlgo={ ANALYTICS_UI_LOCATION }
					segregateFreeAndPaid
					locale={ document.documentElement.lang }
					itemType={ ITEM_TYPE_BUTTON }
					quantity={ NUMBER_OF_VISIBLE_DOMAINS }
				/>
			</div>
		</div>
	);
};

export default DomainDetails;
