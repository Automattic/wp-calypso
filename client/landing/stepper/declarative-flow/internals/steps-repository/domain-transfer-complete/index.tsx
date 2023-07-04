import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import QueryAllDomains from 'calypso/components/data/query-all-domains';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ResponseDomain } from 'calypso/lib/domains/types';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getFlatDomainsList } from 'calypso/state/sites/domains/selectors';
import { CompleteDomainsTransferred } from './complete-domains-transferred';
import type { Step } from '../../types';
import './styles.scss';

const Complete: Step = function Complete( { navigation, flow } ) {
	const { goBack } = navigation;
	const { __ } = useI18n();

	const ManageAllButton = () => {
		return (
			<a href="/domains/manage" className="components-button is-primary manage-all-domains">
				{ __( 'Manage all domains' ) }
			</a>
		);
	};

	const domainsList: ResponseDomain[] = useSelector( getFlatDomainsList );

	const [ newlyTransferredDomains, setNewlyTransferredDomains ] = useState< ResponseDomain[] >(
		[]
	);

	useEffect( () => {
		const currentDate = new Date();

		const domainsFromToday = domainsList?.filter( ( domain ) => {
			const domainRegistrationDate = new Date( domain.registrationDate );

			const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

			const differenceInDays = Math.abs(
				Math.floor( ( currentDate.getTime() - domainRegistrationDate.getTime() ) / oneDay )
			);

			return differenceInDays <= 1;
		} ) as ResponseDomain[];

		setNewlyTransferredDomains( domainsFromToday );
	}, [ domainsList ] );

	const getPluralizedText = () => {
		// translators: %s is the amount of domains transferred for pluralization.
		return sprintf( __( 'Congrats on your domain %(amountOfDomains)s' ), {
			amountOfDomains: newlyTransferredDomains.length > 1 ? 'transfers' : 'transfer',
		} );
	};

	getPluralizedText();
	return (
		<>
			<QueryAllDomains />
			<StepContainer
				flowName={ flow }
				stepName="complete"
				goBack={ goBack }
				isHorizontalLayout={ false }
				isLargeSkipLayout={ false }
				formattedHeader={
					<FormattedHeader
						id="domains-header"
						headerText={ getPluralizedText() }
						subHeaderText={ __(
							'Hold tight as we complete the set up of your newly transferred domain.'
						) }
						align="center"
						children={ <ManageAllButton /> }
					/>
				}
				stepContent={
					<CalypsoShoppingCartProvider>
						<CompleteDomainsTransferred newlyTransferredDomains={ newlyTransferredDomains } />
					</CalypsoShoppingCartProvider>
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
