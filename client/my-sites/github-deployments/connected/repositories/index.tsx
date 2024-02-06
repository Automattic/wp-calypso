import { GitHubEmptyRepositories } from './empty-repositories';

export const GitHubRepositories = () => {
	const repositories = [];

	if ( repositories.length ) {
		return <div>Test</div>;
	}
	return <GitHubEmptyRepositories />;
};
