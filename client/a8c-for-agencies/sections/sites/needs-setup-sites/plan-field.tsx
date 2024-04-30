import { useTranslate } from 'i18n-calypso';
import wpcomIcon from 'calypso/assets/images/icons/wordpress-logo.svg';
import CreateSiteButton from './create-site-button';

export type AvailablePlans = {
	name: string;
	available: number;
	ids: number[];
};

type Props = AvailablePlans & {
	provisioning?: boolean;
	onCreateSite: ( id: number ) => void;
};

export default function PlanField( { name, available, ids, provisioning, onCreateSite }: Props ) {
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

			<CreateSiteButton
				provisioning={ provisioning }
				onActivate={ () => onCreateSite( ids[ 0 ] ) }
			/>
		</div>
	);
}
