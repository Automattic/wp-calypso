import { useTranslate } from 'i18n-calypso';
import heroImage from 'calypso/assets/images/reader/discover-hero.webp';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { Context as PageJSContext } from '@automattic/calypso-router';

import './style.scss';

export const DiscoverLoggedOutHero = () => {
	const translate = useTranslate();

	return (
		<div className="discover-logged-out-hero reader-hero">
			<div className="discover-logged-out-hero__content">
				<h1>{ translate( 'Discover your next favorite blog to read.' ) }</h1>
				<p>{ translate( 'Explore popular blogs that inspire, educate, and entertain.' ) }</p>
				<a
					className="discover-logged-out-hero__cta"
					href="/start/account/user-social?redirect_to=/discover&ref=reader-lp"
					onClick={ () => recordTracksEvent( 'calypso_reader_discover_hero_cta_clicked' ) }
				>
					{ translate( 'Start reading' ) }
				</a>
			</div>
			<div className="discover-logged-out-hero__images" aria-hidden="true">
				<img src={ heroImage } alt="" width={ 800 } height={ 504 } decoding="async" />
			</div>
		</div>
	);
};

export function renderDiscoverLoggedOutHero() {
	return <DiscoverLoggedOutHero />;
}

export function setDiscoverLoggedOutHero( context: PageJSContext ) {
	if ( ! isUserLoggedIn( context.store.getState() ) ) {
		context.renderHeaderSection = renderDiscoverLoggedOutHero;
	}
}
