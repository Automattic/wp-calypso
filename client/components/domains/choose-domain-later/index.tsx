import ReskinSideExplainer from '../reskin-side-explainer';

type Props = {
	hasSearchedDomains: boolean;
	handleDomainExplainerClick: () => void;
	flowName: string;
	showEscapeHatchAfterQuery: boolean;
};

export default function ChooseDomainLater( {
	hasSearchedDomains,
	handleDomainExplainerClick,
	flowName,
	showEscapeHatchAfterQuery,
}: Props ) {
	if ( showEscapeHatchAfterQuery && ! hasSearchedDomains ) {
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
