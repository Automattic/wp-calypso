/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import debugFactory from 'debug';
/**
 * Internal dependencies
 */
import { EVENT_SAVE, EVENT_USE } from '../../constants';
import CheckIcon from '../assets/icons/check';
import LogoIcon from '../assets/icons/logo';
import MediaIcon from '../assets/icons/media';
import useLogoGenerator from '../hooks/use-logo-generator';
import useRequestErrors from '../hooks/use-request-errors';
import { updateLogo } from '../lib/logo-storage';
import { STORE_NAME } from '../store';
import { ImageLoader } from './image-loader';
import './logo-presenter.scss';
/**
 * Types
 */
import type { LogoPresenterProps } from '../../types';
import type { Logo } from '../store/types';
import type React from 'react';

const debug = debugFactory( 'jetpack-ai-calypso:logo-presenter' );

const SaveInLibraryButton: React.FC< { siteId: string } > = ( { siteId } ) => {
	const {
		saveLogo,
		selectedLogo,
		isSavingLogoToLibrary: saving,
		logos,
		selectedLogoIndex,
		context,
	} = useLogoGenerator();
	const saved = !! selectedLogo?.mediaId;

	const { loadLogoHistory } = useDispatch( STORE_NAME );

	const handleClick = async () => {
		if ( ! saved && ! saving ) {
			recordTracksEvent( EVENT_SAVE, {
				context,
				logos_count: logos.length,
				selected_logo: selectedLogoIndex ? selectedLogoIndex + 1 : 0,
			} );

			try {
				const savedLogo = await saveLogo( selectedLogo );

				// Update localStorage
				updateLogo( {
					siteId,
					url: selectedLogo.url,
					newUrl: savedLogo.mediaURL,
					mediaId: savedLogo.mediaId,
				} );

				// Update state
				loadLogoHistory( siteId );
			} catch ( error ) {
				debug( 'Error saving logo', error );
			}
		}
	};

	return ! saving && ! saved ? (
		<Button className="jetpack-ai-logo-generator-modal-presenter__action" onClick={ handleClick }>
			<Icon icon={ <MediaIcon /> } />
			<span className="action-text">{ __( 'Save in Library', 'jetpack' ) }</span>
		</Button>
	) : (
		<button className="jetpack-ai-logo-generator-modal-presenter__action">
			<Icon icon={ saving ? <MediaIcon /> : <CheckIcon /> } />
			<span className="action-text">
				{ saving ? __( 'Saving…', 'jetpack' ) : __( 'Saved', 'jetpack' ) }
			</span>
		</button>
	);
};

const UseOnSiteButton: React.FC< { onApplyLogo: () => void } > = ( { onApplyLogo } ) => {
	const {
		applyLogo,
		isSavingLogoToLibrary,
		isApplyingLogo,
		selectedLogo,
		logos,
		selectedLogoIndex,
		context,
	} = useLogoGenerator();

	const handleClick = async () => {
		if ( ! isApplyingLogo && ! isSavingLogoToLibrary ) {
			recordTracksEvent( EVENT_USE, {
				context,
				logos_count: logos.length,
				selected_logo: selectedLogoIndex != null ? selectedLogoIndex + 1 : 0,
			} );

			try {
				await applyLogo();
				onApplyLogo();
			} catch ( error ) {
				debug( 'Error applying logo', error );
			}
		}
	};

	return isApplyingLogo && ! isSavingLogoToLibrary ? (
		<button className="jetpack-ai-logo-generator-modal-presenter__action">
			<Icon icon={ <LogoIcon /> } />
			<span className="action-text">{ __( 'Applying logo…', 'jetpack' ) }</span>
		</button>
	) : (
		<Button
			className="jetpack-ai-logo-generator-modal-presenter__action"
			onClick={ handleClick }
			disabled={ isSavingLogoToLibrary || ! selectedLogo?.mediaId }
		>
			<Icon icon={ <LogoIcon /> } />
			<span className="action-text">{ __( 'Use on Site', 'jetpack' ) }</span>
		</Button>
	);
};

const LogoLoading: React.FC = () => {
	return (
		<>
			<ImageLoader className="jetpack-ai-logo-generator-modal-presenter__logo" />
			<span className="jetpack-ai-logo-generator-modal-presenter__loading-text">
				{ __( 'Generating new logo…', 'jetpack' ) }
			</span>
		</>
	);
};

const LogoReady: React.FC< { siteId: string; logo: Logo; onApplyLogo: () => void } > = ( {
	siteId,
	logo,
	onApplyLogo,
} ) => {
	return (
		<>
			<img
				src={ logo.url }
				alt={ logo.description }
				className="jetpack-ai-logo-generator-modal-presenter__logo"
			/>
			<div className="jetpack-ai-logo-generator-modal-presenter__action-wrapper">
				<span className="jetpack-ai-logo-generator-modal-presenter__description">
					{ logo.description }
				</span>
				<div className="jetpack-ai-logo-generator-modal-presenter__actions">
					<SaveInLibraryButton siteId={ siteId } />
					<UseOnSiteButton onApplyLogo={ onApplyLogo } />
				</div>
			</div>
		</>
	);
};

const LogoUpdated: React.FC< { logo: Logo } > = ( { logo } ) => {
	return (
		<>
			<img
				src={ logo.url }
				alt={ logo.description }
				className="jetpack-ai-logo-generator-modal-presenter__logo"
			/>
			<div className="jetpack-ai-logo-generator-modal-presenter__success-wrapper">
				<Icon icon={ <CheckIcon /> } />
				<span>{ __( 'Your logo has been successfully updated!', 'jetpack' ) }</span>
			</div>
		</>
	);
};

export const LogoPresenter: React.FC< LogoPresenterProps > = ( {
	logo = null,
	loading = false,
	onApplyLogo,
	logoAccepted = false,
	siteId,
} ) => {
	const { isRequestingImage } = useLogoGenerator();
	const { saveToLibraryError, logoUpdateError } = useRequestErrors();

	if ( ! logo ) {
		return null;
	}

	let logoContent: React.ReactNode;

	if ( loading || isRequestingImage ) {
		logoContent = <LogoLoading />;
	} else if ( logoAccepted ) {
		logoContent = <LogoUpdated logo={ logo } />;
	} else {
		logoContent = (
			<LogoReady siteId={ String( siteId ) } logo={ logo } onApplyLogo={ onApplyLogo } />
		);
	}

	return (
		<div className="jetpack-ai-logo-generator-modal-presenter__wrapper">
			<div className="jetpack-ai-logo-generator-modal-presenter">
				<div className="jetpack-ai-logo-generator-modal-presenter__content">{ logoContent }</div>
				{ ! logoAccepted && (
					<div className="jetpack-ai-logo-generator-modal-presenter__rectangle" />
				) }
			</div>
			{ saveToLibraryError && (
				<div className="jetpack-ai-logo-generator__prompt-error">
					{ __( 'Error saving the logo to your library. Please try again.', 'jetpack' ) }
				</div>
			) }
			{ logoUpdateError && (
				<div className="jetpack-ai-logo-generator__prompt-error">
					{ __( 'Error applying the logo to your site. Please try again.', 'jetpack' ) }
				</div>
			) }
		</div>
	);
};
