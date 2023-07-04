import { localizeUrl } from '@automattic/i18n-utils';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { ResponseDomain } from 'calypso/lib/domains/types';
import type { FC } from 'react';

type Props = {
	newlyTransferredDomains: ResponseDomain[];
};

const FormatDate: FC< { date: string | null } > = ( { date } ) => {
	const { __ } = useI18n();
	if ( date === null ) {
		return __( '' );
	}
	const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
	const formattedDate = new Date( date ).toLocaleString( undefined, options );
	// translators: %s date that will be dynamic.
	return <p>{ sprintf( __( 'Expires on %s' ), formattedDate ) }</p>;
};

export const CompleteDomainsTransferred = ( { newlyTransferredDomains }: Props ) => {
	const { __ } = useI18n();

	return (
		<>
			<div className="domain-complete-summary">
				<ul className="domain-complete-list">
					{ newlyTransferredDomains.map( ( domain, key ) => {
						return (
							<li className="domain-complete-list-item" key={ key }>
								<div>
									<h2>{ domain.domain }</h2>
									<FormatDate date={ domain.expiry } />
								</div>
								<a
									href={ `/domains/manage/${ domain.domain }` }
									className="components-button is-secondary"
								>
									{ __( 'Manage domain' ) }
								</a>
							</li>
						);
					} ) }
				</ul>
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
