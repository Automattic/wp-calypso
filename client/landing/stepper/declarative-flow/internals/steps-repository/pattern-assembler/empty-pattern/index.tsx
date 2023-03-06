import { Button } from '@automattic/components';
import classnames from 'classnames';
import './style.scss';

interface Props {
	className?: string;
	text: string;
	onSelect: () => void;
}

const EmptyPattern = ( { className, text, onSelect }: Props ) => {
	return (
		<Button className={ classnames( 'empty-pattern', className ) } onClick={ () => onSelect() }>
			{ text }
		</Button>
	);
};

export default EmptyPattern;
