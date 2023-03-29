import { useTranslate } from 'i18n-calypso';
import { SiteType } from '../types';
import SiteRow from './site-row';
import './styles.scss';

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
				<span className="actions" role="columnheader" />
			</li>
			{ sites.map( ( site ) => (
				<SiteRow key={ site.id } site={ site } />
			) ) }
		</ul>
	);
}
