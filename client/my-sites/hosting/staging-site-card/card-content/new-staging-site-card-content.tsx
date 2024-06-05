import { Button } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { HostingCardDescription } from 'calypso/components/hosting-card';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { ExceedQuotaErrorContent } from './exceed-quota-error-content';

type CardContentProps = {
	onAddClick: () => void;
	isButtonDisabled: boolean;
	showQuotaError: boolean;
};

export const NewStagingSiteCardContent = ( {
	onAddClick,
	isButtonDisabled,
	showQuotaError,
}: CardContentProps ) => {
	{
		const translate = useTranslate();
		const hasEnTranslation = useHasEnTranslation();

		return (
			<>
				<HostingCardDescription>
					{ hasEnTranslation(
						'Preview and troubleshoot changes before updating your production site. {{a}}Learn more{{/a}}.'
					)
						? translate(
								'Preview and troubleshoot changes before updating your production site. {{a}}Learn more{{/a}}.',
								{
									components: {
										a: (
											<InlineSupportLink supportContext="hosting-staging-site" showIcon={ false } />
										),
									},
								}
						  )
						: translate(
								'A staging site is a test version of your website you can use to preview and troubleshoot changes before applying them to your production site. {{a}}Learn more{{/a}}.',
								{
									components: {
										a: (
											<InlineSupportLink supportContext="hosting-staging-site" showIcon={ false } />
										),
									},
								}
						  ) }
				</HostingCardDescription>
				<Button primary disabled={ isButtonDisabled } onClick={ onAddClick }>
					<span>{ translate( 'Add staging site' ) }</span>
				</Button>
				{ showQuotaError && <ExceedQuotaErrorContent /> }
			</>
		);
	}
};
