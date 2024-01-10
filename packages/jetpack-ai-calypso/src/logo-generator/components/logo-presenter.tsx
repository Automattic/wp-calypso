/**
 * External dependencies
 */
import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import CheckIcon from '../assets/icons/check';
import LogoIcon from '../assets/icons/logo';
import MediaIcon from '../assets/icons/media';
import useLogoGenerator from '../hooks/use-logo-generator';
import { ImageLoader } from './image-loader';
import './logo-presenter.scss';
/**
 * Types
 */
import type { LogoPresenterProps } from '../../types';
import type React from 'react';

const SaveInLibraryButton: React.FC = () => {
	const { saveLogo, selectedLogo, isSavingLogoToLibrary: saving } = useLogoGenerator();
	const saved = !! selectedLogo?.mediaId;

	const handleClick = async () => {
		if ( ! saved && ! saving ) {
			try {
				await saveLogo();
			} catch ( error ) {
				// TODO: Handle error
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
	const { applyLogo, isSavingLogoToLibrary, isApplyingLogo } = useLogoGenerator();

	const handleClick = async () => {
		if ( ! isApplyingLogo && ! isSavingLogoToLibrary ) {
			try {
				await applyLogo();
				onApplyLogo();
			} catch ( error ) {
				// TODO: Handle error
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
			disabled={ isSavingLogoToLibrary }
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

	if ( ! logo ) {
		return null;
	}

	return (
		<div className="jetpack-ai-logo-generator-modal-presenter">
			<div className="jetpack-ai-logo-generator-modal-presenter__container">
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
	);
};
