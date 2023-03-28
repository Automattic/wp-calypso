import { useTranslate } from 'i18n-calypso';
import SiteRow from './site-row';
import { SiteType } from './site-types';

type SiteProps = {
	sites: SiteType[];
};

export default function SiteList( { sites }: SiteProps ) {
	const translate = useTranslate();

	return (
		<ul className="subscription-manager__site-list" role="table">
			<li className="row header" role="row">
				<span className="title-box" role="columnheader">
					{ translate( 'Subscribed site' ) }
				</span>
				<span className="date" role="columnheader">
					{ translate( 'Since' ) }
				</span>
				<span className="email-frequency" role="columnheader">
					{ translate( 'Email frequency' ) }
				</span>
			</li>
			{ sites.map( ( site ) => (
				<SiteRow key={ site.id } { ...site } />
			) ) }
		</ul>
	);
}
