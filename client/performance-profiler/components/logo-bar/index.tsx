import { useTranslate } from 'i18n-calypso';
import BloombergLogo from 'calypso/assets/images/start-with/Bloomberg.svg';
import CNNLogo from 'calypso/assets/images/start-with/CNN.svg';
import CondeNast from 'calypso/assets/images/start-with/Conde_Nast.svg';
import DisneyLogo from 'calypso/assets/images/start-with/Disney.svg';
import MetaLogo from 'calypso/assets/images/start-with/Meta.svg';
import NewsCorpLogo from 'calypso/assets/images/start-with/News_Corp.svg';
import SlackLogo from 'calypso/assets/images/start-with/Slack.svg';
import TechCrunchImage from 'calypso/assets/images/start-with/Tech_Crunch.svg';
import TimeLogo from 'calypso/assets/images/start-with/Time.svg';
import USATodayImage from 'calypso/assets/images/start-with/USA_Today.svg';

import './style.scss';

export const LogoBar = () => {
	const translate = useTranslate();

	return (
		<div className="logo-bar">
			<img src={ TimeLogo } alt={ translate( 'Time Logo' ) } />
			<img src={ DisneyLogo } alt={ translate( 'Disney Logo' ) } />
			<img src={ SlackLogo } alt={ translate( 'Slack Logo' ) } />
			<img src={ CNNLogo } alt={ translate( 'CNN Logo' ) } />
			<img src={ TechCrunchImage } alt={ translate( 'Tech Crunch Logo' ) } />
			<img src={ USATodayImage } alt={ translate( 'USA Today Sports Logo' ) } />
			<img src={ BloombergLogo } alt={ translate( 'Bloomberg Logo' ) } />
			<img src={ MetaLogo } alt={ translate( 'Meta Logo' ) } />
			<img src={ NewsCorpLogo } alt={ translate( 'News Corp Logo' ) } />
			<img src={ CondeNast } alt={ translate( 'Conde Nast Logo' ) } />
		</div>
	);
};
