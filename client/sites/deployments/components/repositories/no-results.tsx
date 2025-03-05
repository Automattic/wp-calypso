import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { external, Icon } from '@wordpress/icons';

export const NoResults = ( { manageInstallationUrl }: { manageInstallationUrl: string } ) => {
	return (
		<div className="github-deployments-repositories__no-results">
			<p>{ __( 'No Results found' ) }</p>
			<p>
				{ __(
					'Make sure that WordPress.com has access to the GitHub repositories you’d like to connect to.'
				) }
			</p>
			<Button variant="primary" target="_blank" href={ manageInstallationUrl }>
				{ __( 'Check permissions' ) }
				<Icon icon={ external } size={ 18 } />
			</Button>
		</div>
	);
};
