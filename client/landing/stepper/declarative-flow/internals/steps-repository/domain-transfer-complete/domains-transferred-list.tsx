import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useDispatch as useWpDataDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { Purchase } from 'calypso/lib/purchases/types';
import './styles.scss';

type Props = {
	purchases: Purchase[] | undefined;
};

const DomainsTransferredList = ( { purchases }: Props ) => {
	const { __ } = useI18n();
	const { resetOnboardStore } = useWpDataDispatch( ONBOARD_STORE );

	const handleUserClick = ( destination: string ) => {
		recordTracksEvent( 'calypso_domain_transfer_complete_click', {
			destination,
		} );
	};

	const clearDomainsStore = () => {
		recordTracksEvent( 'calypso_domain_transfer_complete_click', {
			destination: '/setup/domain-transfer',
		} );
		resetOnboardStore();
	};

	console.log( 'purchases', purchases );

	return (
		<>
			<div className="domain-header-buttons">
				<a
					href="/setup/domain-transfer"
					onClick={ clearDomainsStore }
					className="components-button is-secondary"
				>
					{ __( 'Transfer more domains' ) }
				</a>

				<a
					href="/domains/manage?filter=owned-by-me&sortKey=registered-until"
					className="components-button is-primary manage-all-domains"
					onClick={ () => handleUserClick( '/domains/manage' ) }
				>
					{ __( 'Manage all domains' ) }
				</a>
			</div>
			<div className="domain-complete-summary">
				<ul className="domain-complete-list">
					{ purchases &&
						purchases.map( ( { meta }, key ) => {
							return (
								<li className="domain-complete-list-item" key={ key }>
									<div>
										<h2>{ meta }</h2>
										<p>{ __( 'Auto-renew enabled' ) }</p>
									</div>
									<a
										href={ `/domains/manage/all/${ meta }/transfer/in` }
										className="components-button is-secondary"
										onClick={ () => handleUserClick( `/domains/manage/all/${ meta }/transfer/in` ) }
									>
										{ __( 'Manage domain' ) }
									</a>
								</li>
							);
						} ) }
				</ul>
			</div>
		</>
	);
};

export default DomainsTransferredList;
