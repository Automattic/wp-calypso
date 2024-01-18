/**
 * External dependencies
 */
import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import debugFactory from 'debug';
/**
 * Internal dependencies
 */
import CheckIcon from '../assets/icons/check';
import LogoIcon from '../assets/icons/logo';
import MediaIcon from '../assets/icons/media';
import useLogoGenerator from '../hooks/use-logo-generator';
import useRequestErrors from '../hooks/use-request-errors';
import { ImageLoader } from './image-loader';
import './logo-presenter.scss';
/**
 * Types
 */
import type { LogoPresenterProps } from '../../types';
import type React from 'react';

const debug = debugFactory( 'jetpack-ai-calypso:logo-presenter' );

const SaveInLibraryButton: React.FC = () => {
	const { saveLogo, selectedLogo, isSavingLogoToLibrary: saving } = useLogoGenerator();
	const saved = !! selectedLogo?.mediaId;

	const handleClick = async () => {
		if ( ! saved && ! saving ) {
			try {
				await saveLogo( selectedLogo );
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
	const { applyLogo, isSavingLogoToLibrary, isApplyingLogo, selectedLogo } = useLogoGenerator();

	const handleClick = async () => {
		if ( ! isApplyingLogo && ! isSavingLogoToLibrary ) {
			try {
				await applyLogo();
				onApplyLogo();
			} catch ( error ) {
				debug( 'Error enhancing prompt', error );
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

export const LogoPresenter: React.FC< LogoPresenterProps > = ( {
	logo = null,
	loading = false,
	onApplyLogo,
} ) => {
	const { isRequestingImage } = useLogoGenerator();
	const { saveToLibraryError, logoUpdateError } = useRequestErrors();

	if ( ! logo ) {
		return null;
	}

	return (
		<div className="jetpack-ai-logo-generator-modal-presenter__wrapper">
			<div className="jetpack-ai-logo-generator-modal-presenter">
				<div className="jetpack-ai-logo-generator-modal-presenter__content">
					{ loading || isRequestingImage ? (
						<>
							<ImageLoader className="jetpack-ai-logo-generator-modal-presenter__logo" />
							<span className="jetpack-ai-logo-generator-modal-presenter__loading-text">
								{ __( 'Generating new logo…', 'jetpack' ) }
							</span>
						</>
					) : (
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
									<SaveInLibraryButton />
									<UseOnSiteButton onApplyLogo={ onApplyLogo } />
								</div>
							</div>
						</>
					) }
				</div>
				<div className="jetpack-ai-logo-generator-modal-presenter__rectangle" />
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
