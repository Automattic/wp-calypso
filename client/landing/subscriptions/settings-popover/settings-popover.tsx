import classNames from 'classnames';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import './styles.scss';

type SettingsPopoverProps = {
	children?: React.ReactNode;
	className?: string;
};

const SettingsPopover = ( { children, className }: SettingsPopoverProps ) => (
	<EllipsisMenu popoverClassName={ classNames( 'settings-popover', className ) }>
		{ children }
	</EllipsisMenu>
);

export default SettingsPopover;
