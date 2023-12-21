import { CircularProgressBar } from '@automattic/components';
import { Checklist, type Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function NextSteps( { onDismiss = () => {} } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const tracksPrefix = 'calypso_jetpack_manage_overview_next_steps';

	const tasks: Task[] = [
		{
			calypso_path: '',
			completed: true,
			disabled: false,
			actionDispatch: () => {
				dispatch( recordTracksEvent( tracksPrefix + '_get_familiar_click' ) );
			},
			id: 'get_familiar',
			title: 'Get familiar with the sites management dashboard',
			useCalypsoPath: true,
		},
		{
			calypso_path: '',
			completed: true,
			disabled: false,
			actionDispatch: () => {
				dispatch( recordTracksEvent( tracksPrefix + '_add_sites_click' ) );
			},
			id: 'add_sites',
			title: 'Learn how to add new sites',
			useCalypsoPath: true,
		},
		{
			calypso_path: '',
			completed: true,
			disabled: false,
			actionDispatch: () => {
				dispatch( recordTracksEvent( tracksPrefix + '_bulk_editing_click' ) );
			},
			id: 'bulk_editing',
			title: 'Learn bulk editing and enabling downtime monitoring',
			useCalypsoPath: true,
		},
		{
			calypso_path: '',
			completed: true,
			disabled: false,
			actionDispatch: () => {
				dispatch( recordTracksEvent( tracksPrefix + '_plugin_management_click' ) );
			},
			id: 'plugin_management',
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
					<button
						className="dismiss"
						onClick={ () => {
							dispatch( recordTracksEvent( tracksPrefix + '_dismiss_click' ) );
							onDismiss();
						} }
					>
						{ translate( 'Hide' ) }
					</button>
				</p>
			) }
			<Checklist tasks={ tasks } />
		</div>
	);
}
