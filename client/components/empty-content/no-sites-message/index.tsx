import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { ReactNode } from 'react';
import noSitesIllustration from 'calypso/assets/images/illustrations/illustration-nosites.svg';
import EmptyContent from 'calypso/components/empty-content';
import { onboardingUrl } from 'calypso/lib/paths';

import './style.scss';

interface NoSitesMessageProps {
	title?: ReactNode;
	line?: ReactNode;
	action?: string;
	actionURL?: string;
	illustration?: false;
}

const NoSitesMessage = ( {
	title,
	line,
	action,
	actionURL,
	illustration,
}: NoSitesMessageProps ) => {
	const { __ } = useI18n();

	return (
		<EmptyContent
			className={ classNames( 'no-sites-message', {
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
			action={ action ?? __( 'Create a site' ) }
			actionURL={ actionURL ?? onboardingUrl() + '?ref=calypso-nosites' }
			illustration={ illustration === false ? null : noSitesIllustration }
			illustrationWidth={ 124 }
			illustrationHeight={ 101 }
		/>
	);
};

export default NoSitesMessage;
