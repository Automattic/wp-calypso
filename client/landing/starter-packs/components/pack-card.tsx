import { Link } from 'react-router-dom';
import Avatar from './avatar';
import type { StarterPack } from '../data/packs';

interface PackCardProps {
	pack: StarterPack;
}

export default function PackCard( { pack }: PackCardProps ) {
	return (
		<Link to={ `/starter-packs/${ pack.slug }` } className="pack-card">
			<div className="pack-card__avatars">
				{ pack.accounts.slice( 0, 4 ).map( ( account ) => (
					<Avatar
						key={ `${ account.username }@${ account.instance }` }
						src={ account.avatarUrl }
						alt={ account.displayName }
						size={ 36 }
					/>
				) ) }
				{ pack.accounts.length > 4 && (
					<span className="pack-card__avatar-more">+{ pack.accounts.length - 4 }</span>
				) }
			</div>
			<h2 className="pack-card__title">{ pack.title }</h2>
			<p className="pack-card__description">{ pack.description }</p>
			<span className="pack-card__count">
				{ pack.accounts.length } { pack.accounts.length === 1 ? 'account' : 'accounts' }
			</span>
		</Link>
	);
}
