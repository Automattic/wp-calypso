import Sidebar from './sidebar';
import type { StyleVariation } from '@automattic/design-picker';
import './style.scss';

interface PreviewProps {
	title?: string;
	description?: string;
	variations?: StyleVariation[];
}

const Preview: React.FC< PreviewProps > = ( { title, description, variations = [] } ) => {
	return (
		<div className="design-preview">
			<Sidebar title={ title } description={ description } variations={ variations } />
		</div>
	);
};

export default Preview;
