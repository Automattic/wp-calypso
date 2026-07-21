import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import filmIllustration from 'calypso/assets/images/customer-home/illustration--task-code-for-the-people.webp';
import { preventWidows } from 'calypso/lib/formatting';
import { TASK_CODE_FOR_THE_PEOPLE } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

import './style.scss';

const SITE_URL = 'https://codeforthepeople.com/';
const VIDEO_EMBED_URL = 'https://www.youtube.com/embed/8lQijrTaaGg?autoplay=1';

export default function CodeForThePeople() {
	const translate = useTranslate();

	return (
		<Task
			customClass="task__code-for-the-people"
			title={ translate( 'Code for the People' ) }
			description={ preventWidows(
				translate(
					'The human story of the open web. A documentary short about what the internet is for, who gets to own it, and what it takes to keep it free.'
				)
			) }
			actionText={ translate( 'Watch the film' ) }
			actionUrl={ SITE_URL }
			actionTarget="_blank"
			illustration={ <FilmIllustration /> }
			illustrationAlwaysShow
			taskId={ TASK_CODE_FOR_THE_PEOPLE }
		/>
	);
}

function FilmIllustration() {
	const translate = useTranslate();
	const [ isPlaying, setIsPlaying ] = useState( false );

	if ( isPlaying ) {
		return (
			<div className="task__code-for-the-people-illustration is-playing">
				<iframe
					src={ VIDEO_EMBED_URL }
					title={ translate( 'Code for the People — official video' ) }
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowFullScreen
				/>
			</div>
		);
	}

	return (
		<button
			className="task__code-for-the-people-illustration"
			onClick={ () => setIsPlaying( true ) }
			aria-label={ translate( 'Play the video' ) }
		>
			<img src={ filmIllustration } alt="" />
			<span className="task__code-for-the-people-play">
				<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path d="M8 5.5v13l11-6.5z" />
				</svg>
			</span>
		</button>
	);
}
