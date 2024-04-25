import classNames from 'classnames';
import './style.scss';

type Props = {
	children?: React.ReactNode;
	className?: string;
};

export default function ItemPreviewPaneFooter( { children, className }: Props ) {
	return (
		children && (
			<>
				<div className={ classNames( 'item-preview__footer', className ) }>{ children }</div>
			</>
		)
	);
}
