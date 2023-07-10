import { OnboardSelect } from '@automattic/data-stores';
import { useSelect, useDispatch as useWpDataDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE as DOMAINS_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector, useDispatch } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { fetchUserPurchases } from 'calypso/state/purchases/actions';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import { ONBOARD_STORE } from '../../../../stores';
import { CompleteDomainsTransferred } from './complete-domains-transferred';
import type { Step } from '../../types';
import './styles.scss';

const Complete: Step = function Complete( { flow } ) {
	const { __, _n } = useI18n();
	const dispatch = useDispatch();

	// Use the stored domains as a clue for the number of domains that were transferred to render placeholders.
	// This number is used as a rough guess, and shouldn't be used to render anything.
	const storedDomainsState = useSelect(
		( select ) => ( select( DOMAINS_STORE ) as OnboardSelect ).getBulkDomainsData(),
		[]
	);
	const storedDomainsAmount = Object.keys( { ...storedDomainsState } ).length;
	const { setDomainsTransferData } = useWpDataDispatch( ONBOARD_STORE );

	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const userPurchases = useSelector( ( state ) => getUserPurchases( state ) );
	const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

	const newlyTransferredDomains = userPurchases?.filter(
		( purchase ) =>
			purchase.productSlug === 'domain_transfer' &&
			Date.now() - new Date( purchase.subscribedDate ).getTime() < oneDay
	);

	useEffect( () => {
		dispatch( fetchUserPurchases( userId ) );
	}, [] );

	const clearDomainsStore = () => {
		setDomainsTransferData( {} );
	};

	return (
		<>
			<StepContainer
				flowName={ flow }
				stepName="complete"
				isHorizontalLayout={ false }
				isLargeSkipLayout={ false }
				formattedHeader={
					<FormattedHeader
						id="domains-header"
						headerText={ _n(
							'Congrats on your domain transfer',
							'Congrats on your domain transfers',
							newlyTransferredDomains?.length || storedDomainsAmount
						) }
						subHeaderText={ _n(
							'Hold tight as we complete the set up of your newly transferred domain.',
							'Hold tight as we complete the set up of your newly transferred domains.',
							newlyTransferredDomains?.length || storedDomainsAmount
						) }
						align="center"
						children={
							<div className="domain-header-buttons">
								<a
									href="/setup/domain-transfer"
									onClick={ clearDomainsStore }
									className="components-button is-secondary"
								>
									{ __( 'Transfer more domains' ) }
								</a>

								<a
									href="/domains/manage"
									className="components-button is-primary manage-all-domains"
								>
									{ __( 'Manage all domains' ) }
								</a>
							</div>
						}
					/>
				}
				stepContent={
					<CompleteDomainsTransferred
						placeHolderCount={ storedDomainsAmount }
						newlyTransferredDomains={ newlyTransferredDomains }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
				showHeaderJetpackPowered={ false }
				showHeaderWooCommercePowered={ false }
				showVideoPressPowered={ false }
				showJetpackPowered={ false }
				hideBack={ true }
			/>
		</>
	);
};

export default Complete;
