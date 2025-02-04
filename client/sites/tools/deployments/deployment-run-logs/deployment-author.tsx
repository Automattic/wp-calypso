import { __ } from '@wordpress/i18n';
interface DeploymentAuthorProps {
	name: string;
	avatarUrl: string;
}

export const DeploymentAuthor = ( { name, avatarUrl }: DeploymentAuthorProps ) => {
	return (
		<div className="github-deployments-commit-author">
			<img src={ avatarUrl } alt={ __( "The commit author's profile pic" ) } />
			<span>{ name }</span>
		</div>
	);
};
