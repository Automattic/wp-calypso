import { __unstableCompositeItem as CompositeItem } from '@wordpress/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

interface Props {
	className?: string;
	text: string;
	isSelected?: boolean;
	composite?: unknown;
	onSelect: () => void;
}

const EmptyPattern = ( { className, text, isSelected, composite, onSelect }: Props ) => {
	const translate = useTranslate();

	return (
		<CompositeItem
			{ ...composite }
			role="option"
			as="button"
			className={ classnames( 'empty-pattern', className ) }
			onClick={ () => onSelect() }
			aria-label={ translate( 'Blank pattern' ) }
			aria-current={ isSelected }
		>
			{ text }
		</CompositeItem>
	);
};

export default EmptyPattern;
