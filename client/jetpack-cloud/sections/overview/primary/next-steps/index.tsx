import { CircularProgressBar } from '@automattic/components';
import { Checklist, type Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function NextSteps( { onDismiss = () => {} } ) {
	const translate = useTranslate();

	const tasks: Task[] = [
		{
			calypso_path: '',
			completed: false,
			disabled: false,
			actionDispatch: () => {},
			id: 'jpmanage-overview-next-steps-get-familiar',
			title: 'Get familiar with the sites management dashboard',
			useCalypsoPath: true,
		},
		{
			calypso_path: '',
			completed: false,
			disabled: false,
			actionDispatch: () => {},
			id: 'jpmanage-overview-next-steps-add-sites',
			title: 'Learn how to add new sites',
			useCalypsoPath: true,
		},
		{
			calypso_path: '',
			completed: false,
			disabled: false,
			actionDispatch: () => {},
			id: 'jpmanage-overview-next-steps-bulk-editing',
			title: 'Learn bulk editing and enabling downtime monitoring',
			useCalypsoPath: true,
		},
		{
			calypso_path: '',
			completed: false,
			disabled: false,
			actionDispatch: () => {},
			id: 'jpmanage-overview-next-steps-plugin_management',
			title: 'Explore plugin management',
			useCalypsoPath: true,
		},
	];

	const numberOfTasks = tasks.length;
	const completedTasks = tasks.filter( ( task ) => task.completed ).length;

	const isCompleted = completedTasks === numberOfTasks;

	return (
		<div className="next-steps">
			<div className="next-steps__header">
				<h2>{ isCompleted ? translate( '🎉 Congratulations!' ) : translate( 'Next Steps' ) }</h2>
				<CircularProgressBar
					size={ 32 }
					enableDesktopScaling
					numberOfSteps={ numberOfTasks }
					currentStep={ completedTasks }
				/>
			</div>
			{ isCompleted && (
				<p>
					{ translate(
						"Right now there's nothing left for you to do. We'll let you know when anything needs your attention."
					) }{ ' ' }
					<button className="dismiss" onClick={ onDismiss }>
						{ translate( 'Hide' ) }
					</button>
				</p>
			) }
			<Checklist tasks={ tasks } />
		</div>
	);
}
