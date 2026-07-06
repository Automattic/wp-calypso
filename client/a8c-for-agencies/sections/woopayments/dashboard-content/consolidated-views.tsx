import ConsolidatedViews from 'calypso/dashboard/agency/earn/woopayments/consolidated-views';
import { useWooPaymentsContext } from '../context';

const WooPaymentsConsolidatedViews = () => {
	const { woopaymentsData, isLoadingWooPaymentsData } = useWooPaymentsContext();

	return (
		<div className="consolidated-view">
			<ConsolidatedViews
				woopaymentsData={ woopaymentsData }
				isLoading={ isLoadingWooPaymentsData }
			/>
		</div>
	);
};

export default WooPaymentsConsolidatedViews;
