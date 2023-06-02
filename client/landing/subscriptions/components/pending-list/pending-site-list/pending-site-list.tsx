import { Reader } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import PendingSiteRow from './pending-site-row';
import '../styles.scss';

type PendingSiteListProps = {
	pendingSites?: Reader.PendingSiteSubscription[];
};

export default function PendingSiteList( { pendingSites }: PendingSiteListProps ) {
	const translate = useTranslate();

	return (
		<ul className="subscription-manager__pending-list" role="table">
			<li className="row header" role="row">
				<span className="title-box" role="columnheader">
					{ translate( 'Subscribed site' ) }
				</span>
				<span className="date" role="columnheader">
					{ translate( 'Since' ) }
				</span>
				<span className="actions" role="columnheader" />
			</li>
			{ pendingSites &&
				pendingSites.map( ( pendingSite ) => (
					<PendingSiteRow key={ `pendingSites.siterow.${ pendingSite.id }` } { ...pendingSite } />
				) ) }
		</ul>
	);
}
