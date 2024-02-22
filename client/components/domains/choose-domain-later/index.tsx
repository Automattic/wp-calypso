import ReskinSideExplainer from '../reskin-side-explainer';

type Props = {
	hasSearchedDomains: boolean;
	handleDomainExplainerClick: () => void;
	flowName: string;
	showEscapeHatchAfterSearch: boolean;
};

export default function ChooseDomainLater( {
	hasSearchedDomains,
	handleDomainExplainerClick,
	flowName,
	showEscapeHatchAfterSearch,
}: Props ) {
	if ( showEscapeHatchAfterSearch && ! hasSearchedDomains ) {
		return null;
	}

	return (
		<div className="domains__domain-side-content domains__free-domain">
			<ReskinSideExplainer
				onClick={ handleDomainExplainerClick }
				type={
					showEscapeHatchAfterSearch
						? 'free-domain-explainer-treatment-type'
						: 'free-domain-explainer'
				}
				flowName={ flowName }
			/>
		</div>
	);
}
