import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { external, Icon } from '@wordpress/icons';

export const NoResults = () => {
	return (
		<div className="github-deployments-repositories__no-results">
			<p>{ __( 'No Results found' ) }</p>
			<p>
				{ __(
					'Double check in the WordPress.com Deploy app to make sure that WordPress.com has access to the GitHub repositories you’d like to connect to.'
				) }
			</p>
			<Button className="is-primary" href="#">
				{ __( 'Check permissions' ) }
				<Icon icon={ external } size={ 18 } />
			</Button>
		</div>
	);
};
