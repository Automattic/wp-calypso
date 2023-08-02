import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
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
				<Button primary disabled={ isButtonDisabled } onClick={ onAddClick }>
					<span>{ translate( 'Add staging site' ) }</span>
				</Button>
				{ showQuotaError && <ExceedQuotaErrorContent /> }
			</>
		);
	}
};
