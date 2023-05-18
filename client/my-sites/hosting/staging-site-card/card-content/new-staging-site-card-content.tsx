import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { ExceedQuotaErrorContent } from './exceed-quota-error-content';

type CardContentProps = {
	disabled: boolean;
	addingStagingSite: boolean;
	isLoadingQuotaValidation: boolean;
	hasValidQuota: boolean;
	onAddClick: () => void;
};

export const NewStagingSiteCardContent = ( {
	disabled,
	addingStagingSite,
	isLoadingQuotaValidation,
	hasValidQuota,
	onAddClick,
}: CardContentProps ) => {
	{
		const translate = useTranslate();
		return (
			<>
				<p>
					{ translate(
						'A staging site is a test version of your website you can use to preview and troubleshoot changes before applying them to your production site. {{a}}Learn more{{/a}}.',
						{
							components: {
								a: <InlineSupportLink supportContext="hosting-staging-site" showIcon={ false } />,
							},
						}
					) }
				</p>
				<Button
					primary
					disabled={ disabled || addingStagingSite || isLoadingQuotaValidation || ! hasValidQuota }
					onClick={ onAddClick }
				>
					<span>{ translate( 'Add staging site' ) }</span>
				</Button>
				{ ! hasValidQuota && ! isLoadingQuotaValidation && <ExceedQuotaErrorContent /> }
			</>
		);
	}
};
