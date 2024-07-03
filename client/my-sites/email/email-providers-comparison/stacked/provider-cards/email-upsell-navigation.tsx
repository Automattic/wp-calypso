import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './email-upsell-navigation.scss';

type Props = {
	backUrl: string;
	skipUrl?: string;
};

const EmailUpsellNavigation = ( { backUrl, skipUrl }: Props ) => {
	const translate = useTranslate();

	return (
		<div
			className={ clsx( 'email-upsell-navigation', {
				'is-hiding-skip': ! skipUrl,
			} ) }
		>
			<Button borderless href={ backUrl }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ translate( 'Back' ) }
			</Button>

			{ skipUrl && (
				<Button borderless href={ skipUrl }>
					{ translate( 'Skip' ) }
					<Gridicon icon="arrow-right" size={ 18 } />
				</Button>
			) }
		</div>
	);
};

export default EmailUpsellNavigation;
