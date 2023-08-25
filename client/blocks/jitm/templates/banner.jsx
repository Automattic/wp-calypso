import { Banner } from 'calypso/components/banner';

import './banner.scss';

export default function BannerTemplate( props ) {
	const { trackImpression, message, CTA, description, iconPath, onClick } = props;

	return (
		<>
			{ trackImpression && trackImpression() }
			<Banner
				className="banner-jitm"
				title={ message }
				description={ description }
				callToAction={ CTA.message }
				iconPath={ iconPath }
				onClick={ onClick }
				compactButton={ false }
				disableCircle
			/>
		</>
	);
}
