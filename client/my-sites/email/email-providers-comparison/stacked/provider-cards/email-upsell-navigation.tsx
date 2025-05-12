import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { recordEmailUpsellTracksEvent } from 'calypso/my-sites/email/email-management/home/utils';

import './email-upsell-navigation.scss';

type Props = {
	backUrl: string;
	skipUrl?: string;
};

const EmailUpsellNavigation = ( { backUrl, skipUrl }: Props ) => {
	const translate = useTranslate();

	const handleBackClick = () => {
		recordEmailUpsellTracksEvent( 'email', 'navigation_back' );
	};

	const handleSkipClick = () => {
		recordEmailUpsellTracksEvent( 'email', 'navigation_skip' );
	};

	return (
		<div
			className={ clsx( 'email-upsell-navigation', {
				'is-hiding-skip': ! skipUrl,
			} ) }
		>
			<Button borderless href={ backUrl } onClick={ handleBackClick }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ translate( 'Back' ) }
			</Button>

			{ skipUrl && (
				<Button borderless href={ skipUrl } onClick={ handleSkipClick }>
					{ translate( 'Skip' ) }
					<Gridicon icon="arrow-right" size={ 18 } />
				</Button>
			) }
		</div>
	);
};

export default EmailUpsellNavigation;
