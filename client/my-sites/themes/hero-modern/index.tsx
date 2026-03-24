import FullWidthSection from 'calypso/components/full-width-section';
import { SearchThemes } from 'calypso/components/search-themes';
import { preventWidows } from 'calypso/lib/formatting';
import useThemeShowcaseLoggedOutSeoContent from '../use-theme-showcase-logged-out-seo-content';
import './style.scss';

interface HeroModernProps {
	filter: string;
	searchQuery: string;
	tier: string;
	onSearch: ( query: string ) => void;
	onSearchTracksEvent: ( eventName: string, eventProperties?: object ) => void;
}

const HeroModern = ( {
	filter,
	searchQuery,
	tier,
	onSearch,
	onSearchTracksEvent,
}: HeroModernProps ) => {
	const loggedOutSeoContent = useThemeShowcaseLoggedOutSeoContent( filter, tier );
	const { header, description } = loggedOutSeoContent;

	return (
		<FullWidthSection enabled className="hero-modern">
			<div className="hero-modern__content">
				<h1 className="hero-modern__title">{ preventWidows( header ) }</h1>
				<p className="hero-modern__description">{ preventWidows( description ) }</p>
				<div className="hero-modern__search">
					<SearchThemes
						query={ searchQuery }
						onSearch={ onSearch }
						recordTracksEvent={ onSearchTracksEvent }
					/>
				</div>
			</div>
		</FullWidthSection>
	);
};

export default HeroModern;
