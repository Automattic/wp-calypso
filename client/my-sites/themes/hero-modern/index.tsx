import { useTranslate } from 'i18n-calypso';
import FullWidthSection from 'calypso/components/full-width-section';
import { SearchThemes } from 'calypso/components/search-themes';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

interface HeroModernProps {
	searchQuery: string;
	onSearch: ( query: string ) => void;
	onSearchTracksEvent: ( eventName: string, eventProperties?: object ) => void;
}

const HeroModern = ( { searchQuery, onSearch, onSearchTracksEvent }: HeroModernProps ) => {
	const translate = useTranslate();

	return (
		<FullWidthSection enabled className="hero-modern">
			<div className="hero-modern__content">
				<h1 className="hero-modern__title">
					{ preventWidows( translate( 'Beautiful themes for every idea' ) ) }
				</h1>
				<p className="hero-modern__description">
					{ preventWidows(
						translate(
							'Choose from thousands of free and premium themes to launch your blog, portfolio, store, or business — and customize every detail to make it your own.'
						)
					) }
				</p>
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
