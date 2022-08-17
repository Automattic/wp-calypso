/* eslint-disable wpcalypso/jsx-classname-namespace */
import './styles.scss';
import cx from 'classnames';

type Props = {
	className?: string;
	style?: React.CSSProperties;
	onClick: () => void;
};

export function Item( { className, style, onClick }: Props ) {
	return (
		<div>
			<button
				onClick={ onClick }
				style={ style }
				className={ cx( 'pattern-picker__item', className ) }
			></button>
		</div>
	);
}
