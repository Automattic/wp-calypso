import { Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { UpgradePlanHostingDetailsList } from './constants';

export const UpgradePlanHostingDetails = () => {
	const { __ } = useI18n();

	return (
		<div className="import__upgrade-plan-hosting-details">
			<div className="import__upgrade-plan-hosting-details-header">
				<p className="import__upgrade-plan-hosting-details-header-main">
					{ __( 'Why you should host with us?' ) }
				</p>
				<p className="import__upgrade-plan-hosting-details-header-subtext">
					{ __( 'Check our performance, compared to the average WordPress host' ) }
				</p>
			</div>
			<div className="import__upgrade-plan-hosting-details-list">
				<ul>
					{ UpgradePlanHostingDetailsList.map( ( { title, description, icon }, i ) => (
						<li key={ i }>
							<Icon
								className="import__upgrade-plan-hosting-details-list-icon"
								icon={ icon }
								size={ 24 }
							/>
							<div className="import__upgrade-plan-hosting-details-list-stats">
								<strong>{ title }</strong>
								<span>{ description }</span>
							</div>
						</li>
					) ) }
				</ul>
			</div>
		</div>
	);
};
