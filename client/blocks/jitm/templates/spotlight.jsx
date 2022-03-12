import Spotlight from 'calypso/components/spotlight';

export default function SpotlightTemplate( props ) {
	const { trackImpression, message, CTA, description, icon } = props;

	return (
		<>
			{ trackImpression && trackImpression() }
			<Spotlight
				taglineText={ message }
				illustrationSrc={ icon }
				onClick
				titleText={ description }
				ctaText={ CTA.message }
			/>
		</>
	);
}
