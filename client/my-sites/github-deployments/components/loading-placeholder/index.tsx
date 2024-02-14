import { LoadingPlaceholder } from '@automattic/components';
import './style.scss';

export const GitHubLoadingPlaceholder = () => {
	return (
		<div className="github-deployments-loading-placeholder">
			<LoadingPlaceholder />
			<LoadingPlaceholder />
			<LoadingPlaceholder />
			<LoadingPlaceholder />
		</div>
	);
};
