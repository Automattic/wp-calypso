import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { ReactNode } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import { onboardingUrl } from 'calypso/lib/paths';

import './style.scss';

interface NoSitesMessageProps {
	title?: ReactNode;
	line?: ReactNode;
	action?: string;
	actionURL?: string;
	actionCallback?: () => void;
	illustration?: false;
	hideAction?: boolean;
}

const NoSitesMessage = ( {
	title,
	line,
	action,
	actionURL,
	actionCallback,
	illustration,
	hideAction = false,
}: NoSitesMessageProps ) => {
	const { __ } = useI18n();

	return (
		<EmptyContent
			className={ clsx( 'no-sites-message', {
				'no-sites-message--no-illustration': illustration === false,
			} ) }
			title={
				<div className="empty-content__title no-sites-message__title">
					{ title ?? __( "You don't have any sites yet." ) }
				</div>
			}
			line={
				<p className="empty-content__line no-sites-message__line">
					{ line ??
						__(
							"It's time to get your ideas online. We'll guide you through the process of creating a site that best suits your needs."
						) }
				</p>
			}
			action={ hideAction ? undefined : action ?? __( 'Create a site' ) }
			actionURL={ hideAction ? undefined : actionURL ?? onboardingUrl() + '?ref=calypso-nosites' }
			actionCallback={ hideAction ? undefined : actionCallback }
		/>
	);
};

export default NoSitesMessage;
