import config from '@automattic/calypso-config';
import wpcomIcon from 'calypso/assets/images/icons/wordpress-logo.svg';
import CreateSiteButton from './create-site-button';
import MigrateSiteButton from './migrate-site-button';

export type AvailablePlans = {
	name: string;
	subTitle: React.ReactNode;
	ids: number[];
};

type Props = AvailablePlans & {
	provisioning?: boolean;
	onCreateSite: ( id: number ) => void;
	onMigrateSite: ( id: number ) => void;
};

export default function PlanField( {
	name,
	subTitle,
	ids,
	provisioning,
	onCreateSite,
	onMigrateSite,
}: Props ) {
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
			{ config.isEnabled( 'a4a/site-migration' ) && (
				<MigrateSiteButton onClick={ () => onMigrateSite( ids[ 0 ] ) } />
			) }
		</div>
	);
}
