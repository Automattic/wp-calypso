import { Step } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';

export const NeedHelpLink = ( { onHelpLinkClicked }: { onHelpLinkClicked: () => void } ) => {
	return (
		<span>
			{ translate( 'Need help? {{button}}Have our team email you{{/button}}', {
				components: {
					button: <Step.LinkButton onClick={ onHelpLinkClicked } />,
				},
			} ) }
		</span>
	);
};
