import { useTranslate } from 'i18n-calypso';
import icon from './open-source-heart.svg';
import './style.scss';

const OpenSourceSection: React.FC = () => {
	const translate = useTranslate();

	return (
		<div className="jetpack-open-source">
			<img className="jetpack-open-source__icon" width="54" height="48" src={ icon } alt="" />
			<h3 className="jetpack-open-source__title">{ translate( 'Five for the Future' ) }</h3>
			<p className="jetpack-open-source__desc">
				{ translate(
					'We invest profits from Jetpack back into the WordPress open source community through projects and event sponsorships.'
				) }
			</p>
		</div>
	);
};

export default OpenSourceSection;
