import page from 'page';
import Spotlight from 'calypso/components/spotlight';

export default function SpotlightTemplate( props ) {
	const { trackImpression, message, CTA, description, icon, onClick } = props;

	const spotlightOnClick = () => {
		onClick();

		page( CTA.link );
	};

	return (
		<>
			{ trackImpression && trackImpression() }
			<Spotlight
				taglineText={ message }
				illustrationSrc={ icon }
				onClick={ spotlightOnClick }
				titleText={ description }
				ctaText={ CTA.message }
			/>
		</>
	);
}
