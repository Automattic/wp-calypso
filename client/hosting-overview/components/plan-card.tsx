import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const PlanCard: FC = () => {
	const site = useSelector( getSelectedSite );
	const planName = site?.plan?.product_name_short ?? '';

	const translate = useTranslate();

	console.debug( 'site', site );
	console.debug( 'planName', planName );
	return (
		<>
			<Card className="hosting-overview__card">
				<div>
					<div className="hosting-overview__plan-card-header">
						<h3 className="hosting-overview__plan-card-title">{ planName }</h3>

						<Button
							className="hosting-overview__link-button"
							plain
							href={ `/plans/${ site?.slug }` }
						>
							{ translate( 'Manage plan' ) }
						</Button>
					</div>
					<div>[Plan price goes here]</div>
				</div>
			</Card>
		</>
	);
};

export default PlanCard;
