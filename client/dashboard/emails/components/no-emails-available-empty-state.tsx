import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chooseDomainRoute, addEmailForwarderRoute } from '../../app/router/emails';
import { DataViewsEmptyState } from '../../components/dataviews';
import EmailEmptyIllustration from '../resources/email-empty-illustration';

const NoEmailsAvailableEmptyState = () => {
	const navigate = useNavigate();

	return (
		<DataViewsEmptyState
			title={ __( 'Stand out with professional email' ) }
			description={ __(
				'Get a personalized email address and build your brand with every email you send.'
			) }
			illustration={ <EmailEmptyIllustration /> }
			actions={
				<>
					<Button
						variant="primary"
						__next40pxDefaultSize
						onClick={ () => navigate( { to: chooseDomainRoute.to } ) }
					>
						{ __( 'Add mailbox' ) }
					</Button>
					<Button
						className="emails__add-email-forwarder"
						variant="secondary"
						__next40pxDefaultSize
						onClick={ () => navigate( { to: addEmailForwarderRoute.to } ) }
					>
						{ __( 'Add email forwarder' ) }
					</Button>
				</>
			}
		/>
	);
};

export default NoEmailsAvailableEmptyState;
