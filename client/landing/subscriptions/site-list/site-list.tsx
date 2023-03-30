import { useTranslate } from 'i18n-calypso';
import SiteRow from './site-row';
import './styles.scss';
import type { SiteSubscription } from '@automattic/data-stores/src/reader/types';

type SiteListProps = {
	sites: SiteSubscription[];
};

export default function SiteList( { sites }: SiteListProps ) {
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
			{ sites &&
				sites.map( ( site ) => <SiteRow key={ `sites.siterow.${ site.ID }` } { ...site } /> ) }
		</ul>
	);
}
