import { Icon, chevronLeft } from '@wordpress/icons';
import { Link, useParams } from 'react-router-dom';
import FormattedHeader from 'calypso/components/formatted-header';
import { getPackBySlug } from '../data/packs';
import AccountCard from './account-card';
import SubscribeActions from './subscribe-actions';

export default function PackDetail() {
	const { slug } = useParams< { slug: string } >();
	const pack = slug ? getPackBySlug( slug ) : undefined;

	if ( ! pack ) {
		return (
			<div className="pack-detail pack-detail--not-found">
				<h1>Pack not found</h1>
				<p>
					The starter pack you are looking for does not exist.{ ' ' }
					<Link to="/starter-packs">Browse all packs</Link>.
				</p>
			</div>
		);
	}

	return (
		<div className="pack-detail">
			<Link to="/starter-packs" className="pack-detail__back">
				<Icon icon={ chevronLeft } size={ 20 } />
				All Starter Packs
			</Link>

			<FormattedHeader
				brandFont
				headerText={ pack.title }
				subHeaderText={ pack.description }
				align="left"
			/>

			<SubscribeActions pack={ pack } />

			<div className="pack-detail__accounts">
				{ pack.accounts.map( ( account ) => (
					<AccountCard key={ `${ account.username }@${ account.instance }` } account={ account } />
				) ) }
			</div>
		</div>
	);
}
