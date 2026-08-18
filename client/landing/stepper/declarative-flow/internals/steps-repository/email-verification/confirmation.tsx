import { Step } from '@automattic/onboarding';
import { Button as WPButton, __experimentalVStack as VStack } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import type { ReactNode } from 'react';

import './confirmation.scss';

interface Props {
	// Partner/Woo branding, so the top bar matches the rest of the flow.
	logo?: ReactNode;
	// Escape hatch for the reader whose original tab is gone (closed, or a different device).
	onContinue: () => void;
}

/**
 * What the confirmation-link tab shows: a static "you're verified" notice. The flow is completed by
 * the original tab's polling, so this tab intentionally does nothing — no polling, no advancing —
 * which is what keeps it from racing that tab into site creation.
 */
const EmailVerifiedConfirmation = ( { logo, onContinue }: Props ) => {
	const { __ } = useI18n();
	const title = __( 'Email verified' );

	return (
		<>
			<DocumentHead title={ title } />
			<Step.CenteredColumnLayout
				columnWidth={ 4 }
				headingColumnWidth={ 4 }
				verticalAlign="center"
				noGap
				className="onboarding-email-verified step-container-v2--user"
				topBar={ <Step.TopBar logo={ logo } /> }
				heading={ <Step.Heading align="left" text={ title } /> }
			>
				<VStack spacing={ 6 }>
					<p className="onboarding-email-verified__sub-text">
						{ __(
							'Your email is confirmed. Return to the tab where you started to finish setting up your site.'
						) }
					</p>
					<WPButton
						className="onboarding-email-verified__continue"
						variant="link"
						onClick={ onContinue }
					>
						{ __( 'Closed your other tab? Continue setting up your site' ) }
					</WPButton>
				</VStack>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default EmailVerifiedConfirmation;
