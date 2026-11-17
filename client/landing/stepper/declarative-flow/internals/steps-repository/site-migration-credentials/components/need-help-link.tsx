import { Step } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';

export const NeedHelpLink = ( {
	onHelpLinkClicked,
	isBusy,
}: {
	onHelpLinkClicked: () => void;
	isBusy: boolean;
} ) => {
	return (
		<span>
			{ translate( 'Need help? {{button}}Have our team email you{{/button}}', {
				components: {
					button: (
						<Step.LinkButton onClick={ onHelpLinkClicked } isBusy={ isBusy } disabled={ isBusy } />
					),
				},
			} ) }
		</span>
	);
};
