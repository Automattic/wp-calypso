/* eslint-disable wpcalypso/jsx-classname-namespace */
import './styles.scss';
import cx from 'classnames';

type Props = {
	className?: string;
	style?: React.CSSProperties;
	onClick: () => void;
	autoFocus?: boolean;
};

export function Item( { className, style, onClick, autoFocus }: Props ) {
	return (
		<div>
			<button
				onClick={ onClick }
				style={ style }
				className={ cx( 'pattern-picker__item', className ) }
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus={ autoFocus }
			></button>
		</div>
	);
}
