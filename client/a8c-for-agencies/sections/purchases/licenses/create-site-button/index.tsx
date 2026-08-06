import { Button } from '@automattic/components';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

type Props = {
	isProvisioning: boolean;
	isLoading: boolean;
	onCreateSite: () => void;
	className?: string;
	primary?: boolean;
	borderless?: boolean;
};

export default function CreateSiteButton( {
	isProvisioning,
	isLoading,
	onCreateSite,
	className,
	primary,
	borderless,
}: Props ) {
	const translate = useTranslate();

	return (
		<Button
			className={ className }
			compact
			primary={ primary }
			borderless={ borderless }
			busy={ isLoading }
			disabled={ isLoading || isProvisioning }
			onClick={ onCreateSite }
		>
			{ isProvisioning ? (
				<span className="licenses-create-site-button-provisioning">
					<Spinner />
					{ translate( 'Creating site…' ) }
				</span>
			) : (
				translate( 'Create site' )
			) }
		</Button>
	);
}
