import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';

interface Props {
	isCompleted: boolean;
	linkTo: string;
	id: number;
	title: string;
}

const LaunchpadListItem = ( { isCompleted, id, linkTo, title }: Props ) => (
	<li className={ `launchpad__task-${ id }` }>
		<button
			className="launchpad__list-item"
			onClick={ () => console.log( `navigate to ${ linkTo }` ) } // eslint-disable-line
			data-task={ id }
		>
			<div className="launchpad__list-item-status">
				{ isCompleted ? (
					<Gridicon
						aria-label={ translate( 'Task complete' ) }
						className="launchpad__list-item-status-complete"
						icon="checkmark"
						size={ 18 }
					/>
				) : (
					<div
						role="img"
						aria-label={ translate( 'Task incomplete' ) }
						className="launchpad__list-item-status-pending"
					/>
				) }
			</div>
			<p className={ `launchpad__list-item-text ${ isCompleted && 'completed' }` }>{ title }</p>
			<Gridicon className="launchpad__list-item-chevron" icon="chevron-right" size={ 18 } />
		</button>
	</li>
);

export default LaunchpadListItem;
