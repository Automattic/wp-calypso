import wpcomIcon from 'calypso/assets/images/icons/wordpress-logo.svg';
import CreateSiteButton from './create-site-button';

export type AvailablePlans = {
	name: string;
	subTitle: React.ReactNode;
	ids: number[];
};

type Props = AvailablePlans & {
	provisioning?: boolean;
	onCreateSite: ( id: number ) => void;
};

export default function PlanField( { name, subTitle, ids, provisioning, onCreateSite }: Props ) {
	return (
		<div className="plan-field">
			<div className="plan-field__icon">
				<img src={ wpcomIcon } alt="" />
			</div>

			<div className="plan-field__content">
				<div className="plan-field__name">{ name }</div>
				<div className="plan-field__sub">{ subTitle }</div>
			</div>

			<CreateSiteButton
				provisioning={ provisioning }
				onActivate={ () => onCreateSite( ids[ 0 ] ) }
			/>
		</div>
	);
}
