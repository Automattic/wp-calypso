import { Task, TaskAction } from '../../types';
import ActionLink from './action-link';

export const createAction = ( action: TaskAction, key: number ) => {
	switch ( action.type ) {
		case 'link':
			return (
				<ActionLink
					key={ key }
					label={ action.content ?? '' }
					href={ action.options?.href ?? '#' }
				/>
			);
		default:
			return null;
	}
};

type BodyProps = {
	task: Task;
};

const Body = ( { task }: BodyProps ) => {
	const content = task.content;
	const actions = task.actions || [];
	return (
		<div className="checklist-item__body">
			{ content && <div className="checklist-item__body-row">{ content }</div> }
			{ actions.length && (
				<div className="checklist-item__body-row">
					{ actions.map( ( action, index ) => {
						return createAction( action, index );
					} ) }
				</div>
			) }
		</div>
	);
};

export default Body;
