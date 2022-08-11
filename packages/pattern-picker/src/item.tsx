/* eslint-disable wpcalypso/jsx-classname-namespace */
import './styles.scss';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import cx from 'classnames';

type Props = {
	className?: string;
	style?: React.CSSProperties;
	onClick: () => void;
};

export function Item( { className, style, onClick }: Props ) {
	const { __ } = useI18n();
	return (
		<div>
			<button
				onClick={ onClick }
				style={ style }
				className={ cx( 'pattern-picker__item', className ) }
			></button>
			<Button className="pattern-picker__select" isPrimary>
				{ __( 'Continue' ) }
			</Button>
		</div>
	);
}
