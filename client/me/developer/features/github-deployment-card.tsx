import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useHandleClickLink } from './use-handle-click-link';

import './style.scss';

export const GitHubDeploymentCard = () => {
	const translate = useTranslate();
	const handleClickLink = useHandleClickLink();

	return (
		<Card className="developer-features-list__item">
			<div className="developer-features-list__item-tag">{ translate( 'New' ) }</div>
			<div className="developer-features-list__item-title">
				{ translate( 'GitHub Deployments' ) }
			</div>
			<div className="developer-features-list__item-description">
				{ translate(
					'Speed up your development workflow and take version control further by connecting your WordPress.com sites and GitHub repos. Choose from fully automatic or on-demand deployments.'
				) }
			</div>
			<div className="developer-features-list__item-learn-more">
				<InlineSupportLink
					supportContext="github-deployments"
					showIcon={ false }
					onClick={ handleClickLink }
				/>
			</div>
		</Card>
	);
};
