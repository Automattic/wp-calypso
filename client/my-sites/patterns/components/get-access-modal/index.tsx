import { Button, Dialog } from '@automattic/components';
import { useLocalizeUrl, useLocale, useHasEnTranslation } from '@automattic/i18n-utils';
import { Icon, close as iconClose } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { usePatternCategories } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import { getPatternPermalink } from 'calypso/my-sites/patterns/lib/get-pattern-permalink';
import { URL_REFERRER_PARAM } from 'calypso/my-sites/patterns/paths';
import { Pattern } from 'calypso/my-sites/patterns/types';

import './style.scss';

type PatternsGetAccessModalProps = {
	isOpen: boolean;
	onClose: () => void;
	pattern: Pattern;
	tracksEventHandler: ( eventName: string ) => void;
};

export const PatternsGetAccessModal = ( {
	isOpen,
	onClose,
	pattern,
	tracksEventHandler,
}: PatternsGetAccessModalProps ) => {
	const locale = useLocale();
	const hasEnTranslation = useHasEnTranslation();
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const { category } = usePatternsContext();
	const { data: categories = [] } = usePatternCategories( locale );

	const isLoggedIn = false;
	const redirectUrl = getPatternPermalink( pattern, category, categories );

	const signupUrl = localizeUrl(
		`//wordpress.com/start/account/user?${ new URLSearchParams( {
			redirect_to: redirectUrl,
			ref: URL_REFERRER_PARAM,
		} ) }`,
		locale,
		isLoggedIn
	);

	const loginUrl = localizeUrl(
		`//wordpress.com/log-in?${ new URLSearchParams( { redirect_to: redirectUrl } ) }`,
		locale,
		isLoggedIn
	);

	return (
		<Dialog
			isVisible={ isOpen }
			additionalClassNames="patterns-get-access-modal"
			additionalOverlayClassNames="patterns-get-access-modal__backdrop"
			onClose={ () => {
				onClose();
				tracksEventHandler( 'calypso_pattern_library_get_access_dismiss' );
			} }
		>
			<div className="patterns-get-access-modal__content">
				<button
					className="patterns-get-access-modal__close"
					onClick={ () => {
						onClose();
						tracksEventHandler( 'calypso_pattern_library_get_access_dismiss' );
					} }
				>
					<Icon icon={ iconClose } size={ 24 } />
				</button>

				<div className="patterns-get-access-modal__inner">
					<div className="patterns-get-access-modal__title">
						{ translate( 'Unlock the full pattern library', {
							comment:
								'This string is used as a title for the modal that prompts users to sign up or log in to access the full pattern library.',
						} ) }
					</div>

					<div className="patterns-get-access-modal__description">
						{ hasEnTranslation(
							'Build sites faster using hundreds of professionally designed layouts. All you need is a WordPress.com account to get started.'
						)
							? translate(
									'Build sites faster using hundreds of professionally designed layouts. All you need is a WordPress.com account to get started.'
							  )
							: translate(
									"Build sites faster using hundreds of professionally designed layouts. All you need's a WordPress.com account to get started."
							  ) }
					</div>
					<div className="patterns-get-access-modal__upgrade-buttons">
						<Button
							primary
							href={ signupUrl }
							onClick={ () => tracksEventHandler( 'calypso_pattern_library_get_access_signup' ) }
						>
							{ translate( 'Create a free account' ) }
						</Button>
						<Button
							transparent
							href={ loginUrl }
							onClick={ () => tracksEventHandler( 'calypso_pattern_library_get_access_login' ) }
							rel="external"
						>
							{ translate( 'Log in' ) }
						</Button>
					</div>
				</div>
			</div>
		</Dialog>
	);
};
