import { useTranslate } from 'i18n-calypso';
import './style.scss';

interface Props {
	count: number;
	progress: number;
}

const FlowProgress: React.FC< Props > = ( { count, progress } ) => {
	const translate = useTranslate();
	if ( count > 1 ) {
		return (
			<div className="flow-progress">
				{ translate( 'Step %(progress)d of %(count)d', { args: { progress, count } } ) }
			</div>
		);
	}

	return null;
};

export default FlowProgress;
