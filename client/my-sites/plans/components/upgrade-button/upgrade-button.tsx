import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

interface UpgradeButtonProps {
	goToCheckoutWithPlan: ( planSlug: string ) => void;
}

const UpgradeButton = ( { goToCheckoutWithPlan }: UpgradeButtonProps ) => {
	const translate = useTranslate();

	return (
		<Button
			className="trial-current-plan__trial-card-cta"
			primary
			onClick={ () => goToCheckoutWithPlan( 'card' ) }
		>
			{ translate( 'Upgrade now' ) }
		</Button>
	);
};

export default UpgradeButton;
