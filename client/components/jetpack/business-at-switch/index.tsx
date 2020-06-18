/**
 * External dependencies
 */
import React, { FC, ReactElement, ReactNode, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import FormattedHeader from 'components/formatted-header';
import QueryEligibility from 'components/data/query-atat-eligibility';
import WPCOMBusinessAT from 'components/jetpack/wpcom-business-at';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getAutomatedTransfer,
	isEligibleForAutomatedTransfer,
} from 'state/automated-transfer/selectors';
import { transferStates } from 'state/automated-transfer/constants';

/**
 * Style dependencies
 */
import './style.scss';

type Props = {
	fallbackDisplay: ReactNode;
	path: string;
};

const Placeholder = () => (
	<>
		<FormattedHeader
			id="business-at-switch"
			className="business-at-switch placeholder__header"
			headerText="Loading..."
			align="left"
		/>

		<div className="business-at-switch placeholder__primary-promo"></div>
	</>
);

/**
 * This component selects the right view for Business plan sites that
 * are not Atomic. If we don't know if the site is eligible for Automated
 * Transfer, it renders a placeholder and an instance of <QueryEligibility />.
 * Once we have an answer, we either display the Automated Transfer view or
 * we display whatever comes next in the middleware stack.
 */
const BusinessATSwitch: FC< Props > = ( { fallbackDisplay, path } ): ReactElement | ReactNode => {
	const siteId = useSelector( getSelectedSiteId );
	const isEligibleForAT = useSelector( ( state ) =>
		isEligibleForAutomatedTransfer( state, siteId )
	);
	const automatedTransferStatus = useSelector( ( state ) => getAutomatedTransfer( state, siteId ) );
	const [ { showATComponent, isLoading }, setState ] = useState( {
		showATComponent: true,
		isLoading: true,
	} );

	useEffect( () => {
		if ( isEmpty( automatedTransferStatus ) ) {
			return setState( {
				isLoading: true,
				showATComponent: true,
			} );
		}
		if ( isEligibleForAT && automatedTransferStatus?.status !== transferStates.COMPLETE ) {
			return setState( {
				isLoading: false,
				showATComponent: true,
			} );
		}
		return setState( {
			isLoading: false,
			showATComponent: false,
		} );
	}, [ automatedTransferStatus, isEligibleForAT ] );

	if ( isLoading ) {
		return (
			<Main className="business-at-switch__loading">
				<QueryEligibility siteId={ siteId } />
				<Placeholder />
			</Main>
		);
	}

	// In the future, we could add another view for the case in which the AT was done
	// but the Jetpack sync process hasn't finish.
	if ( showATComponent ) {
		const primaryProduct = path.includes( '/backup/' ) ? 'backup' : 'scan';
		return (
			<WPCOMBusinessAT
				automatedTransferStatus={ automatedTransferStatus }
				product={ primaryProduct }
			/>
		);
	}

	return fallbackDisplay;
};

export default BusinessATSwitch;
