import akismet from './images/showcase/akismet.webp';
import automattic from './images/showcase/automattic.webp';
import beeper from './images/showcase/beeper.webp';
import berkeleyside from './images/showcase/berkeleyside.webp';
import blockclubchicago from './images/showcase/blockclubchicago.webp';
import crowdsignal from './images/showcase/crowdsignal.webp';
import dayoneapp from './images/showcase/dayoneapp.webp';
import gravatar from './images/showcase/gravatar.webp';
import itgetsbetter from './images/showcase/itgetsbetter.webp';
import jetpack from './images/showcase/jetpack.webp';
import longreads from './images/showcase/longreads.webp';
import newspack from './images/showcase/newspack.webp';
import oaklandside from './images/showcase/oaklandside.webp';
import pressable from './images/showcase/pressable.webp';
import senseilms from './images/showcase/senseilms.webp';
import simplenote from './images/showcase/simplenote.webp';
import thesewcialists from './images/showcase/thesewcialists.webp';
import vaultpress from './images/showcase/vaultpress.webp';
import videopress from './images/showcase/videopress.webp';
import woocommerce from './images/showcase/woocommerce.webp';
import wordpressCom from './images/showcase/wordpress-com.webp';
import wordpressOrg from './images/showcase/wordpress-org.webp';
import wpjobmanager from './images/showcase/wpjobmanager.webp';
import wpscan from './images/showcase/wpscan.webp';
import './hosted-showcase.scss';

// Curated homepages on Automattic hosting (WordPress.com, Pressable, Newspack), captured
// once with ads and cookie banners removed so the backdrop never changes underneath us.
const SHOWCASE_IMAGES = [
	dayoneapp,
	woocommerce,
	itgetsbetter,
	gravatar,
	pressable,
	newspack,
	simplenote,
	beeper,
	jetpack,
	thesewcialists,
	wordpressCom,
	blockclubchicago,
	akismet,
	videopress,
	crowdsignal,
	longreads,
	wpscan,
	berkeleyside,
	senseilms,
	automattic,
	wpjobmanager,
	oaklandside,
	vaultpress,
	wordpressOrg,
];

/** Decorative wall of hosted sites behind the first-site hero. */
export default function HostedShowcase() {
	return (
		<div className="agency-hosted-showcase" aria-hidden="true">
			<div className="agency-hosted-showcase__grid">
				{ SHOWCASE_IMAGES.map( ( src ) => (
					<img key={ src } className="agency-hosted-showcase__tile" src={ src } alt="" />
				) ) }
			</div>
			<div className="agency-hosted-showcase__grain" />
		</div>
	);
}
