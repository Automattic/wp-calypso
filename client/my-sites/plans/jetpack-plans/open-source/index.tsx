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
					'Jetpack contributes {{link}}5% of its resources{{/link}} into WordPress development. That means each Jetpack purchase helps improve the sustainability of the WordPress community and the future of the open web.',
					{
						components: {
							link: (
								<a
									href="https://wordpress.org/five-for-the-future/"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			</p>
		</div>
	);
};

export default OpenSourceSection;
