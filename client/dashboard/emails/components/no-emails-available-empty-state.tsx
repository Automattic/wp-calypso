import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DataViewsEmptyState } from '../../components/dataviews-empty-state';
import EmailEmptyIllustration from '../resources/email-empty-illustration';

const NoEmailsAvailableEmptyState = () => {
	return (
		<DataViewsEmptyState
			title={ __( 'Stand out with professional email' ) }
			description={ __(
				'Get a personalized email address and build your brand with every email you send.'
			) }
			illustration={ <EmailEmptyIllustration /> }
			actions={
				<>
					<Button variant="primary">{ __( 'Add mailbox' ) }</Button>
					<Button className="emails__add-email-forwarder" variant="secondary">
						{ __( 'Add email forwarder' ) }
					</Button>
				</>
			}
		/>
	);
};

export default NoEmailsAvailableEmptyState;
