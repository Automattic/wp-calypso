import { NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { FC, useCallback, useEffect } from 'react';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { useSiteNotWordPressMutation } from '../hooks/use-site-not-wordpress-mutation';

interface Props {
	onSubmit: () => void;
	onHelp: () => void;
	platformName: string | 'Unknown';
}

export const ImportPlatformForwarder: FC< Props > = ( { onSubmit, onHelp, platformName } ) => {
	const translate = useTranslate();
	const siteSlug = useSiteSlugParam() ?? '';
	const { mutateAsync: siteIsNotWordPress } = useSiteNotWordPressMutation( siteSlug );

	useEffect( () => {
		if ( siteSlug ) {
			siteIsNotWordPress();
		}
	}, [ siteSlug, siteIsNotWordPress ] );

	const handleImport = useCallback( () => onSubmit(), [ onSubmit ] );
	const handleHelp = useCallback( () => onHelp(), [ onHelp ] );

	return (
		<div className="site-migration-other-platform__actions">
			{ platformName !== 'Unknown' && (
				<>
					<NextButton onClick={ handleImport }>{ translate( 'Import Your Content' ) }</NextButton>
					<button
						className="button navigation-link step-container__navigation-link has-underline is-borderless"
						onClick={ handleHelp }
						type="button"
					>
						{ translate( 'I need help, please guide me' ) }
					</button>
				</>
			) }
			{ platformName === 'Unknown' && (
				<NextButton onClick={ handleHelp }>
					{ translate( 'I need help, please guide me' ) }
				</NextButton>
			) }
		</div>
	);
};
