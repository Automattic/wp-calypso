import FormattedHeader from 'calypso/components/formatted-header';
import { getAllPacks } from '../data/packs';
import PackCard from './pack-card';

export default function PackDirectory() {
	const packs = getAllPacks();

	return (
		<div className="starter-packs-directory">
			<FormattedHeader
				brandFont
				headerText="Starter Packs"
				subHeaderText="Curated collections of Fediverse accounts to follow. Subscribe via Mastodon, import into your feed reader, or follow on WordPress.com."
				align="left"
			/>
			<div className="starter-packs-directory__grid">
				{ packs.map( ( pack ) => (
					<PackCard key={ pack.slug } pack={ pack } />
				) ) }
			</div>
		</div>
	);
}
