import { localizeUrl } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import QueryAllDomains from 'calypso/components/data/query-all-domains';
import { getFlatDomainsList } from 'calypso/state/sites/domains/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';

type Props = {
	manageAllDomains: () => void;
};

export const Complete = ( { manageAllDomains }: Props ) => {
	const { __ } = useI18n();

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

	const formatDate = ( date: string | null ): string => {
		if ( date === null ) {
			return '';
		}
		const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
		return new Date( date ).toLocaleString( 'en-US', options );
	};
	return (
		<>
			<QueryAllDomains />
			<div className="domain-complete-summary">
				{ newlyTransferredDomains && (
					<ul className="domain-complete-list">
						{ newlyTransferredDomains.map( ( domain, key ) => {
							return (
								<li className="domain-complete-list-item" key={ key }>
									<div>
										<h2>{ domain.domain }</h2>
										<p>
											{ __( 'Auto renews on ' ) } { formatDate( domain.expiry ) }
										</p>
									</div>
									<button onClick={ manageAllDomains } className="components-button is-secondary">
										{ __( 'Manage domain' ) }
									</button>
								</li>
							);
						} ) }
					</ul>
				) }
			</div>
			<div className="domain-complete-tips">
				<div className="domain-complete-tips-items">
					<div>
						<h2> { __( 'Dive into domain essentials' ) }</h2>
						<p>
							{ __(
								"Unlock the domain world's secrets. Dive into our comprehensive resource to learn the basics of domains, from registration to management."
							) }
						</p>
						<a href={ localizeUrl( 'https://wordpress.com/support/domains/' ) }>
							{ __( 'Master the domain basics' ) }
						</a>
					</div>
					<div>
						<h2> { __( 'Consider moving your sites too?' ) }</h2>
						<p>
							{ __(
								'You can find step-by-step guides below that will help you move your site to WordPress.com'
							) }
						</p>
						<a href={ localizeUrl( 'https://wordpress.com/support/moving-a-blog/' ) }>
							{ __( 'Learn more about site transfers' ) }
						</a>
					</div>
				</div>
			</div>
		</>
	);
};
