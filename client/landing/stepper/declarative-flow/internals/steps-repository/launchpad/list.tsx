import LaunchpadListItem from './list-item';

type Task = {
	id: number;
	isCompleted: boolean;
	linkTo: string;
	title: string;
};

interface Props {
	tasks: Task[];
}

const LaunchpadList = ( { tasks }: Props ) => (
	<ul
		className="launchpad__list"
		role="tablist"
		aria-label="Launchpad Checklist"
		aria-orientation="vertical"
	>
		{ tasks.map( ( task ) => (
			<LaunchpadListItem
				key={ task.id }
				id={ task.id }
				title={ task.title }
				isCompleted={ task.isCompleted }
				linkTo={ task.linkTo }
			/>
		) ) }
	</ul>
);

export default LaunchpadList;
