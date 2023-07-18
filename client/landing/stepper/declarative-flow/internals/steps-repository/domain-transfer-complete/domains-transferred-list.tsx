import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useI18n } from '@wordpress/react-i18n';
import { Purchase } from 'calypso/lib/purchases/types';
import './styles.scss';

type Props = {
	purchases: Purchase[] | undefined;
};

const DomainsTransferredList = ( { purchases }: Props ) => {
	const { __ } = useI18n();

	const handleUserClick = ( destination: string ) => {
		recordTracksEvent( 'calypso_domain_transfer_complete_click', {
			destination,
		} );
	};

	return (
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
	);
};

export default DomainsTransferredList;
