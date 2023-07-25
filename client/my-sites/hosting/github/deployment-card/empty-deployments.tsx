import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

export const EmptyDeployments = () => {
	const translate = useTranslate();
	return (
		<div className="deployment-card__empty-deployments">
			<p>
				{ translate(
					'Push to the connected branch to trigger a deployment. {{a}}Learn more{{/a}}',
					{
						components: {
							a: <ExternalLink href="#" children={ null } />,
						},
					}
				) }
			</p>
		</div>
	);
};
