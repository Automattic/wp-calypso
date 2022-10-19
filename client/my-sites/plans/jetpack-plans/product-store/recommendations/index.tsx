import { useTranslate } from 'i18n-calypso';
import BlueHostLogo from 'calypso/assets/images/illustrations/bluehost-logo.svg';
import DreamHostLogo from 'calypso/assets/images/illustrations/dreamhost-logo.svg';
import HostGatorLogo from 'calypso/assets/images/illustrations/hostgator-logo.svg';
import WordpressDotComLogo from 'calypso/assets/images/illustrations/wordpress.com-logo.svg';

import './style.scss';

const details = [
	{
		logo: WordpressDotComLogo,
		alt: 'WordPress.com',
	},
	{
		logo: BlueHostLogo,
		alt: 'Bluehost',
	},
	{
		logo: HostGatorLogo,
		alt: 'HostGator',
	},
	{
		logo: DreamHostLogo,
		alt: 'DreamHost',
	},
];

export const Recommendations: React.FC = () => {
	const translate = useTranslate();

	return (
		<div className="jetpack-product-store__recommendations">
			<p className="jetpack-product-store__recommendations--title">
				{ translate( 'Recommended by the biggest names in WordPress' ) }
			</p>
			<ul className="jetpack-product-store__recommendations--logos">
				{ details.map( ( { logo, alt } ) => (
					<li key={ alt }>
						<img src={ logo } alt={ alt } loading="lazy" decoding="async" />
					</li>
				) ) }
			</ul>
		</div>
	);
};
