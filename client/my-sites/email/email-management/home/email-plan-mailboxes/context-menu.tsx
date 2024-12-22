import { Icon, desktop, mobile, cloudUpload, payment, settings, login } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import './context-menu.scss';

type Props = {
	className?: string;
};
export default function ContextMenu( { className }: Props ) {
	const translate = useTranslate();

	const options = [
		{
			icon: <Icon icon={ desktop } />,
			label: translate( 'Configure desktop app' ),
		},
		{
			icon: <Icon icon={ mobile } />,
			label: translate( 'Get mobile app' ),
		},
		{
			icon: <Icon icon={ cloudUpload } />,
			label: translate( 'Import email data' ),
		},
		{
			icon: <Icon icon={ settings } />,
			label: translate( 'Configure catch-all email' ),
		},
		{
			icon: <Icon icon={ login } />,
			label: translate( 'Set up internal forwarding' ),
		},
		{
			icon: <Icon icon={ payment } />,
			label: translate( 'View billing and payments' ),
		},
	];

	return (
		<EllipsisMenu className={ className } popoverClassName={ `${ className }-popover` }>
			{ options.map( ( option, key ) => (
				<PopoverMenuItem key={ key } { ...option }>
					{ option.label }
				</PopoverMenuItem>
			) ) }
		</EllipsisMenu>
	);
}
