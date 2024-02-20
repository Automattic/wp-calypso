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
	showEscapeHatchAfterQuery: boolean;
};

export default function ChooseDomainLater( {
	step,
	handleDomainExplainerClick,
	flowName,
	showEscapeHatchAfterQuery,
}: Props ) {
	const domainForm = step?.domainForm ?? {};

	const isDomainResultsLoaded =
		! domainForm.loadingResults &&
		Array.isArray( domainForm?.searchResults ) &&
		domainForm?.searchResults?.length > 0;

	if ( showEscapeHatchAfterQuery && ! isDomainResultsLoaded ) {
		return null;
	}

	return (
		<div className="domains__domain-side-content domains__free-domain">
			<ReskinSideExplainer
				onClick={ handleDomainExplainerClick }
				type={
					showEscapeHatchAfterQuery
						? 'free-domain-explainer-treatment-type'
						: 'free-domain-explainer'
				}
				flowName={ flowName }
			/>
		</div>
	);
}
