import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { getCurrentDashboard } from '../../app/routing';
import { DataViewsEmptyState } from '../../components/dataviews';
import { wpcomLink } from '../../utils/link';
import DomainEmptyIllustration from '../resources/domain-empty-illustration';

const NoDomainsAvailableEmptyState = () => {
	return (
		<DataViewsEmptyState
			title={ __( 'Hold up! You need a domain first.' ) }
			description={ __(
				'Purchase or connect a domain for your site and you’ll be able to add personalised email addresses.'
			) }
			illustration={ <DomainEmptyIllustration /> }
			actions={
				<Button
					variant="primary"
					href={ addQueryArgs( wpcomLink( '/setup/domain' ), {
						dashboard: getCurrentDashboard(),
					} ) }
				>
					{ __( 'Choose a domain' ) }
				</Button>
			}
		/>
	);
};

export default NoDomainsAvailableEmptyState;
