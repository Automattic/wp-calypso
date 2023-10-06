import { TaskBody } from '../../types';
import BodyButton from './body-button';
import BodyText from './body-text';

export const createBodyRow = ( body: TaskBody ) => {
	switch ( body.type ) {
		case 'text':
			return <BodyText text={ body.content ?? '' } />;
		case 'link':
			return <BodyButton label={ body.content ?? '' } href={ body.options?.href ?? '#' } />;
		default:
			return null;
	}
};

type BodyProps = {
	body: TaskBody[];
};

const Body = ( { body }: BodyProps ) => {
	return (
		<>
			{ body.length &&
				body.map( ( bodyRow, index ) => {
					const rowContent = Array.isArray( bodyRow )
						? bodyRow.map( ( row ) => createBodyRow( row ) )
						: createBodyRow( bodyRow );

					return (
						<div key={ index } className="checklist-item__body-row">
							{ rowContent }
						</div>
					);
				} ) }
		</>
	);
};

export default Body;
