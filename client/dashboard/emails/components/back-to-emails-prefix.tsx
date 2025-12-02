import { __ } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { emailsRoute } from '../../app/router/emails';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import './back-to-emails-prefix.scss';

/**
 * PageHeaderPrefix
 *
 * Common prefix for Emails pages' PageHeader: a back link to the Emails root.
 * Keeps styling consistent across pages.
 */
export const BackToEmailsPrefix = ( { onClick }: { onClick?: () => void } ) => {
	return (
		<RouterLinkButton
			className="add-forwarder__back-button"
			icon={ arrowLeft }
			iconSize={ 12 }
			to={ emailsRoute.to }
			onClick={ onClick }
		>
			<Text variant="muted">{ __( 'Emails' ) }</Text>
		</RouterLinkButton>
	);
};

export default BackToEmailsPrefix;
