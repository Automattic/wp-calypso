import './style.scss';

interface Props {
	count?: number;
}

const PatternCount = ( { count = 0 }: Props ) => {
	if ( ! count ) {
		return null;
	}

	return <span className="pattern-count">{ count }</span>;
};

export default PatternCount;
