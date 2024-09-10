import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

type Props = {
	onClick: () => void;
};

export default function MigrateSiteButton( { onClick }: Props ) {
	const translate = useTranslate();

	return (
		<Button className="plan-field__button" onClick={ onClick } plain>
			{ translate( 'Migrate an existing site' ) }
		</Button>
	);
}
