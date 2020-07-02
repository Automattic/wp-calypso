/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import DomainPicker from '@automattic/domain-picker';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { useTrackStep } from '../../hooks/use-track-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import { trackEventWithFlow } from '../../lib/analytics';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { FLOW_ID } from '../../constants';
import ActionButtons, { BackButton } from '../../components/action-buttons';
import { Title, SubTitle } from '../../components/titles';

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

interface Props {
	isModal?: boolean;
}

const DomainsStep: React.FunctionComponent< Props > = ( { isModal } ) => {
	const { __ } = useI18n();

	const history = useHistory();
	const { goBack, goNext } = useStepNavigation();

	const domain = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDomain() );
	const domainSearch = useSelect( ( select ) => select( ONBOARD_STORE ).getDomainSearch() );

	const { setDomain, setDomainSearch } = useDispatch( ONBOARD_STORE );

	// Keep a copy of the selected domain locally so it's available when the component is unmounting
	const selectedDomainRef = React.useRef< string | undefined >();
	React.useEffect( () => {
		selectedDomainRef.current = domain?.domain_name;
	}, [ domain ] );

	useTrackStep( isModal ? 'DomainsModal' : 'Domains', () => ( {
		selected_domain: selectedDomainRef.current,
	} ) );

	const handleBack = () => ( isModal ? history.goBack() : goBack() );
	const handleNext = () => {
		trackEventWithFlow( 'calypso_newsite_domain_select', {
			domain_name: domain?.domain_name,
		} );
		if ( isModal ) {
			history.goBack();
		} else {
			goNext();
		}
	};

	const onDomainSelect = ( suggestion: DomainSuggestion | undefined ) => {
		setDomain( suggestion );
		handleNext();
	};

	const header = (
		<div className="domains__header">
			<div>
				<Title>{ __( 'Choose a domain' ) }</Title>
				<SubTitle>{ __( 'Free for the first year with any paid plan.' ) }</SubTitle>
			</div>
			<ActionButtons>
				<BackButton onClick={ handleBack } />
			</ActionButtons>
		</div>
	);

	return (
		<div className="gutenboarding-page domains">
			<DomainPicker
				header={ header }
				analyticsFlowId={ FLOW_ID }
				initialDomainSearch={ domainSearch }
				onSetDomainSearch={ setDomainSearch }
				currentDomain={ domain?.domain_name }
				onDomainSelect={ onDomainSelect }
				analyticsUiAlgo={ isModal ? 'domain_modal' : 'domain_page' }
			/>
		</div>
	);
};

export default DomainsStep;
