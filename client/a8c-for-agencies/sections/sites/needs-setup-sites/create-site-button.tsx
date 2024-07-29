import { Button } from '@automattic/components';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

type Props = {
	provisioning?: boolean;
	onActivate?: () => void;
};

export default function CreateSiteButton( { provisioning, onActivate }: Props ) {
	const translate = useTranslate();

	if ( provisioning ) {
		return (
			<div className="plan-field__loader">
				<Spinner /> { translate( 'Creating site' ) }...
			</div>
		);
	}

	return (
		<Button className="plan-field__button" onClick={ onActivate } plain>
			{ translate( 'Create new site' ) }
		</Button>
	);
}
