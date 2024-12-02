import Spotlight from 'calypso/components/spotlight';

const illustrationSrc = 'https://ps.w.org/wordpress-seo/assets/icon-256x256.gif';
const url = '/';
const taglineText = 'tagline text';
const titleText = 'title text';
const ctaText = 'cta text';

const SpotlightExample = () => {
	return (
		<Spotlight
			illustrationSrc={ illustrationSrc }
			url={ url }
			taglineText={ taglineText }
			titleText={ titleText }
			ctaText={ ctaText }
		/>
	);
};

SpotlightExample.displayName = 'SpotlightExample';

export default SpotlightExample;
