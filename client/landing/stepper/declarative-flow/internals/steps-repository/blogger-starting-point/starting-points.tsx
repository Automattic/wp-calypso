import { isEnabled } from '@automattic/calypso-config';
import { SelectItem } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { write, play, design } from 'calypso/signup/icons';
import type { StartingPointFlag } from './types';

type StartingPoint = SelectItem< StartingPointFlag >;

const useStartingPoints = (): StartingPoint[] => {
	const translate = useTranslate();

	return [
		{
			key: 'write',
			title: translate( 'Draft your first post' ),
			description: <p>{ translate( 'Start writing and build an audience' ) }</p>,
			icon: write,
			value: 'write',
			actionText: translate( 'Start writing' ),
		},
		{
			key: 'courses',
			title: translate( 'Watch Blogging videos' ),
			description: <p>{ translate( ' Learn the blogging basics in minutes ' ) }</p>,
			icon: play,
			value: 'courses',
			actionText: translate( 'Start learning' ),
			hidden: ! isEnabled( 'signup/starting-point-courses' ),
		},
		{
			key: 'design',
			title: translate( 'Choose a design' ),
			description: <p>{ translate( 'Make your blog feel like home' ) }</p>,
			icon: design,
			value: 'design',
			actionText: translate( 'View designs' ),
		},
	];
};

export default useStartingPoints;
