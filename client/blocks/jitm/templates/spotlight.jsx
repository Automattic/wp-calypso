import page from '@automattic/calypso-router';
import Spotlight from 'calypso/components/spotlight';

export default function SpotlightTemplate( props ) {
	const { trackImpression, message, CTA, description, iconPath, onClick } = props;

	const spotlightOnClick = () => {
		onClick();

		page( CTA.link );
	};

	return (
		<>
			{ trackImpression && trackImpression() }
			<Spotlight
				taglineText={ message }
				illustrationSrc={ iconPath }
				onClick={ spotlightOnClick }
				titleText={ description }
				ctaText={ CTA.message }
			/>
		</>
	);
}
