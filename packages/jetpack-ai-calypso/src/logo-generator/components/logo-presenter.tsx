/**
 * External dependencies
 */
import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
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
import type { Logo } from '../store/types';
import type React from 'react';

const SaveInLibraryButton: React.FC = () => {
	const {
		saveLogo,
		selectedLogo,
		setSavingLogoToLibrary: setSaving,
		savingLogoToLibrary: saving,
	} = useLogoGenerator();
	const saved = !! selectedLogo.mediaId;

	const handleClick = async () => {
		if ( ! saved && ! saving ) {
			try {
				setSaving( true );
				await saveLogo();
			} catch ( error ) {
				// TODO: Handle error
			} finally {
				setSaving( false );
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

const UseOnSiteButton: React.FC = () => {
	const [ updating, setUpdating ] = useState( false );
	const [ updated, setUpdated ] = useState( false );
	const { applyLogo, savingLogoToLibrary } = useLogoGenerator();

	const handleClick = async () => {
		if ( ! updating && ! savingLogoToLibrary ) {
			try {
				setUpdating( true );
				await applyLogo();
				setUpdated( true );
			} catch ( error ) {
				// TODO: Handle error
			} finally {
				setUpdating( false );
			}
		}
	};

	if ( updated ) {
		return null;
	}

	return updating ? (
		<button className="jetpack-ai-logo-generator-modal-presenter__action">
			<Icon icon={ <LogoIcon /> } />
			<span className="action-text">{ __( 'Applying logo…', 'jetpack' ) }</span>
		</button>
	) : (
		<Button
			className="jetpack-ai-logo-generator-modal-presenter__action"
			onClick={ handleClick }
			disabled={ savingLogoToLibrary }
		>
			<Icon icon={ <LogoIcon /> } />
			<span className="action-text">{ __( 'Use on Site', 'jetpack' ) }</span>
		</Button>
	);
};

export const LogoPresenter: React.FC< { logo: Logo; loading?: boolean } > = ( {
	logo,
	loading = false,
} ) => {
	const { isRequestingImage } = useLogoGenerator();
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
								<UseOnSiteButton />
							</div>
						</div>
					</>
				) }
			</div>
			<div className="jetpack-ai-logo-generator-modal-presenter__rectangle" />
		</div>
	);
};
