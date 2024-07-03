import clsx from 'clsx';
import './style.scss';

type Props = {
	children?: React.ReactNode;
	className?: string;
};

export default function ItemPreviewPaneFooter( { children, className }: Props ) {
	return (
		children && (
			<>
				<div className={ clsx( 'item-preview__footer', className ) }>{ children }</div>
			</>
		)
	);
}
