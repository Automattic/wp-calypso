import { Step } from '@automattic/onboarding';
import { globe, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { OptionContent } from 'calypso/components/option-content';

export default function DomainOnlyNew() {
	const translate = useTranslate();

	return (
		<Step.CenteredColumnLayout
			className="step-container-v2--domain-only-new"
			columnWidth={ 6 }
			heading={
				<Step.Heading
					text={ translate( 'Thank you for your purchase!' ) }
					subText={ translate( 'Your new domain is ready! How would you like to use it?' ) }
				/>
			}
			verticalAlign="center"
		>
			<OptionContent
				illustration={ <Icon icon={ globe } /> }
				titleText={ translate( 'My option' ) }
				topText={ translate( "This will be changed later, don't worry!" ) }
				onSelect={ () => {} }
			/>
		</Step.CenteredColumnLayout>
	);
}
