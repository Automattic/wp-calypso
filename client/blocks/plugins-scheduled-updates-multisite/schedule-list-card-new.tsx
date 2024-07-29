import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

interface Props {
	className?: string;
}
export const ScheduleListCardNew = ( props: Props ) => {
	const translate = useTranslate();
	const { className } = props;

	return (
		<div
			className={ clsx(
				'plugins-update-manager-multisite-card plugins-update-manager-multisite-card__new',
				className
			) }
		>
			<div className="plugins-update-manager-multisite-card__label  plugins-update-manager-multisite-card__name-label">
				<strong id="name">{ translate( 'New schedule' ) }</strong>
			</div>
		</div>
	);
};
