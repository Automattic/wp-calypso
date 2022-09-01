import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useThemeDetails } from '../../../../hooks/use-theme-details';
import ThemeFeatures from './theme-features';
import './theme-info-popup.scss';

interface ThemeInfoPopupProps {
	slug: string;
}

interface DescriptionProps {
	author: string;
	author_uri: string;
	description: string;
}

const ThemeInfoPopup = ( { slug }: ThemeInfoPopupProps ) => {
	const { data: theme } = useThemeDetails( slug );

	const ThemeDescription = ( { author_uri, author, description }: DescriptionProps ) => {
		return (
			<div className="theme-info-popup__description popup-item">
				<h1>
					Brought to you by
					<a href={ author_uri } target="_blank" rel="noopener noreferrer">
						{ author }
					</a>
				</h1>
				<p className="theme-info-popup__description">{ description }</p>
			</div>
		);
	};

	const SupportLinks = () => {
		return (
			<div className="theme-info-popup__support-links popup-item">
				<h2>Support</h2>
				<p>
					<a href="https://wordpress.com/help/contact" target="__blank">
						Contact us
					</a>{ ' ' }
					or visit the{ ' ' }
					<a href="https://en.forums.wordpress.com/forum/themes/" target="__blank">
						support forum
					</a>
				</p>
			</div>
		);
	};

	if ( ! theme ) {
		return (
			<div className="theme-info-popup loading">
				<LoadingEllipsis />
			</div>
		);
	}

	const { author, author_uri, description } = theme;
	const features = theme.taxonomies.theme_feature;
	return (
		<div className="theme-info-popup">
			<ThemeDescription author_uri={ author_uri } author={ author } description={ description } />
			<SupportLinks />
			<ThemeFeatures features={ features } heading="Features" />
		</div>
	);
};

export default ThemeInfoPopup;
