import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

export const EmptyDeployments = () => {
	const translate = useTranslate();
	return (
		<div className="deployment-card__empty-deployments">
			<p>
				{ translate(
					'Pushing to the connected branch will trigger a deployment. {{a}}Learn more{{/a}}',
					{
						components: {
							a: <ExternalLink href="#" />,
						},
					}
				) }
			</p>
		</div>
	);
};
