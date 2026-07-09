import { useTranslate } from 'i18n-calypso';
import { write, design } from 'calypso/signup/icons';

const useStartingPoints = () => {
	const translate = useTranslate();

	return [
		{
			key: 'firstPost',
			title: translate( 'Draft your first post' ),
			description: <p>{ translate( 'Start writing and build an audience' ) }</p>,
			icon: write,
			value: 'firstPost',
			actionText: translate( 'Start writing' ),
		},
		{
			key: 'design-setup',
			title: translate( 'Choose a design' ),
			description: <p>{ translate( 'Make your blog feel like home' ) }</p>,
			icon: design,
			value: 'design-setup',
			actionText: translate( 'View designs' ),
		},
	];
};

export default useStartingPoints;
