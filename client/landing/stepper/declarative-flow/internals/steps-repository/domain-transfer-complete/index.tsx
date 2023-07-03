import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { Complete } from './complete';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation, flow } ) {
	const { goBack } = navigation;
	const { __ } = useI18n();

	const redirectToDomains = () => {
		window.location.href = 'https://wordpress.com/domains/manage';
	};

	const ManageAllButton = () => {
		return (
			<button
				onClick={ redirectToDomains }
				className="components-button is-primary manage-all-domains"
			>
				{ __( 'Manage all domains' ) }
			</button>
		);
	};

	return (
		<StepContainer
			flowName={ flow }
			stepName="complete"
			goBack={ goBack }
			isHorizontalLayout={ false }
			isLargeSkipLayout={ false }
			formattedHeader={
				<FormattedHeader
					id="bulk-domains-header"
					headerText={ __( 'Congrats on your domain transfer!' ) }
					subHeaderText={ __(
						'Hold tight as we complete the set up of your newly transferred domain.'
					) }
					align="center"
					children={ <ManageAllButton /> }
				/>
			}
			stepContent={
				<CalypsoShoppingCartProvider>
					<Complete manageAllDomains={ redirectToDomains } />
				</CalypsoShoppingCartProvider>
			}
			recordTracksEvent={ recordTracksEvent }
			showHeaderJetpackPowered={ false }
			showHeaderWooCommercePowered={ false }
			showVideoPressPowered={ false }
			showJetpackPowered={ false }
		/>
	);
};

export default Intro;
