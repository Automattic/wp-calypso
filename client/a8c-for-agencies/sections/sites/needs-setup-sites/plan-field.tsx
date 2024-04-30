import { useTranslate } from 'i18n-calypso';
import wpcomIcon from 'calypso/assets/images/icons/wordpress-logo.svg';

export type AvailablePlans = {
	name: string;
	available: number;
};

export default function PlanField( { name, available }: AvailablePlans ) {
	const translate = useTranslate();

	return (
		<div className="plan-field">
			<div className="plan-field__icon">
				<img src={ wpcomIcon } alt="" />
			</div>

			<div className="plan-field__content">
				<div className="plan-field__name">{ name }</div>
				<div className="plan-field__sub">
					{ translate( '%(count)d site available', '%(count)d sites available', {
						args: {
							count: available,
						},
						count: available,
						comment: 'The `count` is the number of available sites.',
					} ) }
				</div>
			</div>
		</div>
	);
}
