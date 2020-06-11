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
import SignupForm from '../../components/signup-form';
import { useTrackStep } from '../../hooks/use-track-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import { trackEventWithFlow } from '../../lib/analytics';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { getSuggestionsVendor } from 'lib/domains/suggestions';
import { FLOW_ID } from '../../constants';

/**
 * Style dependencies
 */
import './style.scss';

const DOMAIN_SUGGESTION_VENDOR = getSuggestionsVendor( true );
type DomainSuggestion = DomainSuggestions.DomainSuggestion;

interface Props {
	isModal?: boolean;
}

const DomainsStep: React.FunctionComponent< Props > = ( { isModal } ) => {
	const { __ } = useI18n();

	const history = useHistory();
	const { previousStepPath, nextStepPath } = useStepNavigation();

	const [ showSignupDialog, setShowSignupDialog ] = React.useState( false );
	const domain = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDomain() );
	const domainSearch = useSelect( ( select ) => select( ONBOARD_STORE ).getDomainSearch() );

	const { setDomain, setDomainSearch } = useDispatch( ONBOARD_STORE );

	useTrackStep( isModal ? 'DomainsModal' : 'Domains', () => ( {
		selected_domain: domain?.domain_name,
	} ) );

	const handleBack = () => ( isModal ? history.goBack() : history.push( previousStepPath ) );
	const handleNext = () => {
		if ( isModal ) {
			history.goBack();
		} else {
			history.push( nextStepPath );
		}
	};

	const onDomainSelect = ( suggestion: DomainSuggestion | undefined ) => {
		trackEventWithFlow( 'calypso_newsite_domain_select', {
			domain_name: suggestion?.domain_name,
		} );
		setDomain( suggestion );
		handleNext();
	};

	return (
		<div className="gutenboarding-page domains">
			<DomainPicker
				analyticsFlowId={ FLOW_ID }
				initialDomainSearch={ domainSearch || __( 'My new site' ) }
				onSetDomainSearch={ setDomainSearch }
				showDomainConnectButton={ isModal }
				onClose={ handleBack }
				currentDomain={ domain }
				onDomainSelect={ onDomainSelect }
				domainSuggestionVendor={ DOMAIN_SUGGESTION_VENDOR }
				analyticsUiAlgo={ isModal ? 'domain_modal' : 'domain_page' }
			/>
			{ showSignupDialog && <SignupForm onRequestClose={ () => setShowSignupDialog( false ) } /> }
		</div>
	);
};

export default DomainsStep;
