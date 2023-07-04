import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import QueryAllDomains from 'calypso/components/data/query-all-domains';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { getFlatDomainsList } from 'calypso/state/sites/domains/selectors';
import { CompleteDomainsTransferred } from './complete-domains-transferred';
import type { Step } from '../../types';
import './styles.scss';

const Complete: Step = function Complete( { flow } ) {
	const { __, _n } = useI18n();

	const domainsList: ResponseDomain[] = useSelector( getFlatDomainsList );
	const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

	const newlyTransferredDomains = domainsList.filter(
		( domain ) => Date.now() - new Date( domain.registrationDate ).getTime() < oneDay
	);

	return (
		<>
			<QueryAllDomains />
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
							newlyTransferredDomains.length
						) }
						subHeaderText={ __(
							'Hold tight as we complete the set up of your newly transferred domain.'
						) }
						align="center"
						children={
							<a href="/domains/manage" className="components-button is-primary manage-all-domains">
								{ __( 'Manage all domains' ) }
							</a>
						}
					/>
				}
				stepContent={
					<CompleteDomainsTransferred newlyTransferredDomains={ newlyTransferredDomains } />
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
