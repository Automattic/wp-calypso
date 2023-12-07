import React, { useState } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import ReskinSideExplainer from '../reskin-side-explainer';

type Props = {
	step: {
		domainForm: {
			loadingResults: boolean;
			searchResults?: Array< any > | null;
		};
	};
	handleDomainExplainerClick: () => void;
	flowName: string;
};

export default function ChooseDomainLater( props: Props ) {
	const [ isEscapeHatchShownOnce, setisEscapeHatchShownOnce ] = useState( false );
	const [ isLoading, experimentAssignment ] = useExperiment(
		'calypso_gf_signup_onboarding_escape_hatch',
		{
			isEligible: props.flowName === 'onboarding',
		}
	);

	if ( isLoading ) {
		return null;
	}
	const escapeHatchVariant = experimentAssignment?.variationName;
	const { step, handleDomainExplainerClick, flowName } = props;
	const domainForm = step?.domainForm ?? {};

	const isDomainResultsLoaded =
		! domainForm.loadingResults &&
		Array.isArray( domainForm?.searchResults ) &&
		domainForm?.searchResults?.length > 0;

	if (
		escapeHatchVariant === 'treatment_search' &&
		( isEscapeHatchShownOnce || isDomainResultsLoaded )
	) {
		if ( ! isEscapeHatchShownOnce ) {
			setisEscapeHatchShownOnce( true );
		}
		return (
			<div className="domains__domain-side-content domains__free-domain">
				<ReskinSideExplainer
					onClick={ handleDomainExplainerClick }
					type="free-domain-explainer-treatment-search"
					flowName={ flowName }
				/>
			</div>
		);
	} else if (
		escapeHatchVariant === 'treatment_type' &&
		( isEscapeHatchShownOnce || isDomainResultsLoaded )
	) {
		if ( ! isEscapeHatchShownOnce ) {
			setisEscapeHatchShownOnce( true );
		}
		return (
			<div className="domains__domain-side-content domains__free-domain">
				<ReskinSideExplainer
					onClick={ handleDomainExplainerClick }
					type="free-domain-explainer-treatment-type"
					flowName={ flowName }
				/>
			</div>
		);
	}

	if (
		[ 'treatment_search', 'treatment_type' ].includes( escapeHatchVariant ?? '' ) &&
		( domainForm.loadingResults ||
			! Array.isArray( domainForm?.searchResults ) ||
			domainForm?.searchResults?.length === 0 )
	) {
		/**
		 * We do not show the free domain explainer until there is at least one search query
		 */
		return null;
	}

	// The default behavior is the control variant
	return (
		<div className="domains__domain-side-content domains__free-domain">
			<ReskinSideExplainer
				onClick={ handleDomainExplainerClick }
				type="free-domain-explainer"
				flowName={ flowName }
			/>
		</div>
	);
}
