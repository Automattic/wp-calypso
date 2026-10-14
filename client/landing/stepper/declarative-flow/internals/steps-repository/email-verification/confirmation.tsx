import { Step } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import type { ReactNode } from 'react';

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
				columnWidth={ 5 }
				headingColumnWidth={ 5 }
				verticalAlign="center"
				// Opts into the account step's V2 layout contract, the same one the gate uses.
				className="step-container-v2--user"
				topBar={ <Step.TopBar logo={ logo } /> }
				heading={
					<Step.Heading
						align="left"
						text={ title }
						subText={ createInterpolateElement(
							__(
								'<strong>Your email is confirmed!</strong><br/>Return to the tab where you started to finish setting up your site.'
							),
							{ strong: <strong />, br: <br /> }
						) }
					/>
				}
			>
				<p>{ __( 'Accidentally closed the tab where you started?' ) }</p>
				<Step.LinkButton onClick={ onContinue }>
					{ __( 'Click here to continue setting up your site' ) }
				</Step.LinkButton>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default EmailVerifiedConfirmation;
