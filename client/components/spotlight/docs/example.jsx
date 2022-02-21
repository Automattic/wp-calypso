import Spotlight from 'calypso/components/spotlight';

const illustrationSrc = '/illustration.png';
const url = '/path/to/somewhere';
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
