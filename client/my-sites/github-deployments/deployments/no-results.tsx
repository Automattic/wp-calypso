import { __ } from '@wordpress/i18n';

export const NoResults = () => {
	return (
		<div className="github-deployments-list__no-results">
			<p>{ __( 'No Results found' ) }</p>
			<p>{ __( 'Please connect a repository to your site to see deployments.' ) }</p>
		</div>
	);
};
