import { useTranslate } from 'i18n-calypso';
import { write, play } from 'calypso/signup/icons';

const useStartingPoints = () => {
	const translate = useTranslate();

	return [
		{
			key: 'siteEditor',
			title: translate( 'Customize your homepage' ),
			description: <p>{ translate( 'Edit your content and style your site' ) }</p>,
			icon: write,
			value: 'siteEditor',
			actionText: translate( 'Start creating' ),
		},
		{
			key: 'courses',
			title: translate( 'Learn the basics' ),
			description: <p>{ translate( 'Watch videos and be site building in minutes' ) }</p>,
			icon: play,
			value: 'courses',
			actionText: translate( 'Start learning' ),
		},
	];
};

export default useStartingPoints;
