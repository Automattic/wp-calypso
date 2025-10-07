import { __ } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { OptInWelcome } from '../../components/opt-in-welcome';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';

import '../style.scss';

function AddEmailForwarder() {
	return (
		<PageLayout
			header={
				<>
					<PageHeader
						prefix={
							<RouterLinkButton
								className="add-forwarder__back-button"
								icon={ arrowLeft }
								iconSize={ 12 }
								to="/emails"
							>
								<Text variant="muted">{ __( 'Emails' ) }</Text>
							</RouterLinkButton>
						}
					/>
				</>
			}
			notices={ <OptInWelcome tracksContext="emails" /> }
		></PageLayout>
	);
}

export default AddEmailForwarder;
